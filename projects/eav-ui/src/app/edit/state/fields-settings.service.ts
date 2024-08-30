import { computed, inject, Injectable, OnDestroy, signal, Signal } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, Observable, shareReplay } from 'rxjs';
import { FieldSettings } from '../../../../../edit-types';
import { FieldLogicTools } from '../fields/logic/field-logic-tools';
import { FormulaEngine } from '../formulas/formula-engine';
import { ContentTypeSettingsHelpers } from '../shared/helpers';
import { ItemFormulaBroadcastService } from '../formulas/form-item-formula.service';
import { FormulaPromiseHandler } from '../formulas/formula-promise-handler';
import { EavEntityAttributes, EavItem } from '../shared/models/eav';
import { toObservable } from '@angular/core/rxjs-interop';
import { ServiceBase } from '../../shared/services/service-base';
import { EavLogger } from '../../shared/logging/eav-logger';
import { mapUntilObjChanged } from '../../shared/rxJs/mapUntilChanged';
import { FieldSettingsUpdateHelperFactory } from './fields-settings-update.helpers';
import { FieldsSettingsConstantsService } from './fields-settings-constants.service';
import { transient } from '../../core';
import { FormConfigService } from './form-config.service';
import { FormsStateService } from './forms-state.service';
import { FieldConstantsOfLanguage, FieldProps } from './fields-configs.model';
import { TranslationState } from './translate-state.model';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { FieldsSignalsHelper } from './fields-signals.helper';
import { LanguageInstanceService } from '../shared/store/language-instance.service';
import { ContentTypeService } from '../shared/store/content-type.service';
import { ContentTypeItemService } from '../shared/store/content-type-item.service';
import { ItemService } from '../shared/store/item.service';
import { ComputedCacheHelper } from '../../shared/helpers/computed-cache';
import { FieldsPropsEngine } from './fields-properties-engine';
import { FieldsValuesModifiedHelper } from './fields-values-modified.helper';
import isEqual from 'lodash-es/isEqual';

const logThis = true;
const nameOfThis = 'FieldsSettingsService';
// const logOnlyFields = ['Boolean'];

/**
 * FieldsSettingsService is responsible for handling the settings, values and validations of fields.
 *
 * Each instance is responsible for a single entity.
 */
@Injectable()
export class FieldsSettingsService extends ServiceBase implements OnDestroy {

  // Shared / inherited services
  private languageSvc = inject(LanguageInstanceService);
  private formConfig = inject(FormConfigService);
  private globalConfigService = inject(GlobalConfigService);
  private formsStateService = inject(FormsStateService);
  private contentTypeService = inject(ContentTypeService);
  private contentTypeItemService = inject(ContentTypeItemService);
  private itemService = inject(ItemService);

  // Transient services for this instance only
  private constantsService = transient(FieldsSettingsConstantsService);
  private changeBroadcastSvc = transient(ItemFormulaBroadcastService);
  private formulaEngine = transient(FormulaEngine);
  private formulaPromises = transient(FormulaPromiseHandler);

  /** Released field properties after the cycles of change are done */
  private fieldsProps = signal<Record<string, FieldProps>>({}, { equal: isEqual});
  private fieldsProps$ = toObservable(this.fieldsProps);

  private forceRefreshSettings$ = new BehaviorSubject<void>(null);

  /** Current items attributes - to be set once available */
  private itemAttributes$: Observable<EavEntityAttributes>;
  private constFieldPartsOfLanguage$: Observable<FieldConstantsOfLanguage[]>;

  private entityReader$ = this.languageSvc.getEntityReader$(this.formConfig.config.formId);
  private entityReader = this.languageSvc.getEntityReader(this.formConfig.config.formId);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));

    // Debugging effects
    // const attributes = computed(() => {
    //   const itemGuid = this.#itemGuid();
    //   if (itemGuid == null) {
    //     console.log('2dm - null');
    //     return;
    //   }
    //   return this.itemService.getItemAttributes(itemGuid);
    // });

    // effect(() => {
    //   const attr = attributes();
    //   console.log('2dm - effect', attr);
    // });

    // const sigStringInput = computed(() => {
    //   const l = this.log.fn('effect pre-computed');
    //   const val = this.fieldValues.get('Title');
    //   return l.r(val() as string);
    // });

    // effect(() => {
    //   const l = this.log.fn('effect debugFieldSignals');
    //   const val = sigStringInput();
    //   console.log('2dm - effect', val);
    // });
  }

  ngOnDestroy(): void {
    this.forceRefreshSettings$?.complete();
    super.destroy();
  }

  /** The item - set on init, used for many other computations */
  #itemGuid = signal<string>(null);
  #item = signal<EavItem>(null);

  #contentType = computed(() => {
    if (!this.#item())
      return null;
    const contentType = this.contentTypeService.getContentTypeOfItem(this.#item());
    return contentType;
  });

  /** The settings of the content-type of this item */
  public contentTypeSettings = computed(() => !this.#item()
    ? null
    : ContentTypeSettingsHelpers.initDefaultSettings(this.entityReader(), this.#contentType(), this.#item().Header)
  );

  /** Signals for each field value */
  fieldValues = new FieldsSignalsHelper(this.itemService, this.entityReader);

  /** Start the observables etc. to monitor changes */
  init(entityGuid: string): void {
    const l = this.log.fn('init', { entityGuid });

    this.#itemGuid.set(entityGuid);
    const item = this.itemService.get(entityGuid);
    this.#item.set(item);
    this.fieldValues.init(entityGuid);

    const contentType = this.#contentType();
    const slotIsEmpty = this.itemService.slotIsEmpty(entityGuid);

    const modifiedChecker = new FieldsValuesModifiedHelper(this.#contentType, slotIsEmpty);

    this.formulaPromises.init(entityGuid, this.#contentType, this, modifiedChecker, this.changeBroadcastSvc);
    this.formulaEngine.init(entityGuid, this, this.formulaPromises, contentType, this.contentTypeSettings);
    this.changeBroadcastSvc.init(entityGuid, this.entityReader);


    // Constant field parts which don't ever change.
    // They can only be created once the inputTypes and contentTypes are available
    this.constFieldPartsOfLanguage$ = this.constantsService
      .init(item, this.entityReader$, contentType)
      .getUnchangingDataOfLanguage$();

    // WIP trying to drop this observable, but surprisingly it fails...
    this.itemAttributes$ = this.itemService.getItemAttributes$(entityGuid);

    // Prepare / build FieldLogicTools for use in all the formulas / field settings updates
    const prepared$ = combineLatest([
      this.entityReader$, // also exists as signal
      this.globalConfigService.debugEnabled$, // also exists as signal
      this.formsStateService.readOnly$, // also exists as signal
    ]).pipe(
      map(([entityReader, debugEnabled, formReadOnly]) => {
        // Logic Tools are needed when checking for settings defaults etc.
        const logicTools: FieldLogicTools = {
          eavConfig: this.formConfig.config,
          entityReader,
          debug: debugEnabled,
          contentTypeItemService: this.contentTypeItemService,
        };
        // This factory will generate helpers to validate settings updates
        const updHelperFactory = new FieldSettingsUpdateHelperFactory(
          contentType.Metadata,
          entityReader, // for languages current, default, initial
          logicTools,
          formReadOnly.isReadOnly,
          slotIsEmpty,
        );
        return {
          updHelperFactory,
        };
      })
    );

    // temp solution for slotIsEmpty - needed ATM, otherwise formulas don't run when the slot-setting changes
    const watchHeaderChanges$ = this.itemService.getItemHeader$(entityGuid);

    this.subscriptions.add(
      combineLatest([
        this.itemAttributes$,
        this.entityReader$,
        this.forceRefreshSettings$,
        this.constFieldPartsOfLanguage$,
        prepared$,
        watchHeaderChanges$,
      ]).pipe(
        map(([itemAttributes, entityReader, _, constantFieldParts, prepared, __]) => {
          // 1. Create list of all current language form values (as is stored in the entity-store) for further processing
          const formValues = entityReader.currentValues(itemAttributes);
          const engine = new FieldsPropsEngine(
            item,
            itemAttributes,
            formValues,
            this.fieldsProps(),
            constantFieldParts,

            entityReader,
            prepared.updHelperFactory,
            modifiedChecker,
            this.formulaEngine,
            this.formulaPromises,
          );

          const { valueChanges, props } = engine.getLatestSettingsAndValues();
          
          // TODO: 2dm - not sure why but everything seems to work without this
          // which I find very suspicious
          // if (Object.keys(valueChanges).length > 0)
          //   this.changeBroadcastSvc.applyValueChangesFromFormulas(valueChanges);

          return props;
        }),
        filter(fieldsProps => !!fieldsProps), // filter out nulls to skip/not process
      ).subscribe(fieldsProps => {
        this.fieldsProps.set(fieldsProps);
      })
    );
  }

  /**
   * Used to get field properties for all fields.
   * @returns Object that has attribute name as a key and all of its field properties as a value
   */
  getFieldsProps(): Record<string, FieldProps> {
    return this.fieldsProps();
  }

  /**
   * Used to get field properties stream for all fields.
   * @returns Stream of objects that has attribute name as a key and all of its field properties as a value
   */
  getFieldsProps$(): Observable<Record<string, FieldProps>> {
    return this.fieldsProps$;
  }

  /**
   * Used for getting field settings for a specific field.
   * @param fieldName
   * @returns Field settings
   */
  getFieldSettings(fieldName: string): FieldSettings {
    return this.fieldsProps()[fieldName].settings;
  }

  /**
   * Used for getting field settings stream for a specific field.
   * @param fieldName
   * @returns Field settings stream
   */
  getFieldSettings$(fieldName: string): Observable<FieldSettings> {
    return this.fieldsProps$.pipe(
      mapUntilObjChanged(fieldsSettings => fieldsSettings[fieldName].settings),
    );
  }

  getFieldSettingsSignal(fieldName: string): Signal<FieldSettings> {
    /* will access the signal internally, so it's "hot" */
    return this.#fieldSignalsCache.getOrCreate(fieldName, () => this.getFieldSettings(fieldName));
  }
  #fieldSignalsCache = new ComputedCacheHelper<string, FieldSettings>();

  /**
   * Used for translation state stream for a specific field.
   * @param fieldName
   * @returns Translation state stream
   */
  getTranslationState(fieldName: string): Signal<TranslationState> {
    return this.#signalsTransStateCache.getOrCreate(fieldName, () => this.fieldsProps()[fieldName].translationState);
  }
  #signalsTransStateCache = new ComputedCacheHelper<string, TranslationState>();

  /**
   * Triggers a reevaluation of all formulas.
   */
  retriggerFormulas(): void {
    this.forceRefreshSettings$.next();
  }

  /**
   * Modify a setting, ATM just to set collapsed / dialog-open states.
   * Note that this change won't fire the formulas - which may not be correct.
   */
  updateSetting(fieldName: string, update: Partial<FieldSettings>): void {
    const all = this.fieldsProps();
    const ofField = all[fieldName];
    const newProps = {
      ...all,
      [fieldName]: {
        ...ofField,
        settings: { ...ofField.settings, ...update }
      }
    };
    this.fieldsProps.set(newProps);
  }
}
