import { computed, inject, Injectable, OnDestroy, signal, Signal } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, Observable, shareReplay } from 'rxjs';
import { FieldSettings, PickerItem } from '../../../../../edit-types';
import { FieldLogicTools } from '../fields/logic/field-logic-tools';
import { FormulaEngine } from '../formulas/formula-engine';
import { ContentTypeSettingsHelpers } from '../shared/helpers';
import { ContentTypeItemService, ContentTypeService, ItemService, LanguageInstanceService } from '../shared/store/ngrx-data';
import { ItemFormulaBroadcastService } from '../formulas/form-item-formula.service';
import { FormulaPromiseHandler } from '../formulas/formula-promise-handler';
import { EavEntityAttributes, EavItem } from '../shared/models/eav';
import { toSignal } from '@angular/core/rxjs-interop';
import { ServiceBase } from '../../shared/services/service-base';
import { EavLogger } from '../../shared/logging/eav-logger';
import { mapUntilObjChanged } from '../../shared/rxJs/mapUntilChanged';
import { FieldSettingsUpdateHelperFactory } from './fields-settings-update.helpers';
import { FieldsSettingsConstantsService } from './fields-settings-constants.service';
import { transient } from '../../core';
import { FormConfigService } from './form-config.service';
import { FormsStateService } from './forms-state.service';
import { ItemHelper } from '../shared/helpers/item.helper';
import { WrapperHelper } from '../fields/wrappers/wrapper.helper';
import { FieldsProps, FieldConstantsOfLanguage, TranslationState } from './fields-configs.model';
import { ItemValuesOfLanguage } from './item-values-of-language.model';
import { GlobalConfigService } from '../../shared/services/global-config.service';

const logThis = false;
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

  /** Local field properties - updated throughout cycles but only "released" selectively */
  private latestFieldProps: FieldsProps = {};

  /** Released field properties after the cycles of change are done */
  private fieldsProps$ = new BehaviorSubject<FieldsProps>(null);

  private forceRefreshSettings$ = new BehaviorSubject<void>(null);

  /** Current items attributes - to be set once available */
  private itemAttributes$: Observable<EavEntityAttributes>;
  private constFieldPartsOfLanguage$: Observable<FieldConstantsOfLanguage[]>;

  private entityReader$ = this.languageSvc.getEntityReader$(this.formConfig.config.formId);
  private entityReader = this.languageSvc.getEntityReader(this.formConfig.config.formId);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  ngOnDestroy(): void {
    this.fieldsProps$?.complete();
    this.forceRefreshSettings$?.complete();
    super.destroy();
  }

  /** The item - set on init, used for many other computations */
  #item = signal<EavItem>(null);

  #contentType = computed(() => {
    if (!this.#item())
      return null;
    const contentTypeNameId = ItemHelper.getContentTypeNameId(this.#item());
    const contentType = this.contentTypeService.getContentType(contentTypeNameId);
    return contentType;
  });

  /** The settings of the content-type of this item */
  contentTypeSettings = computed(() => !this.#item()
    ? null
    : ContentTypeSettingsHelpers.initDefaultSettings(this.entityReader(), this.#contentType(), this.#item().Header)
  );

  /** Start the observables etc. to monitor changes */
  init(entityGuid: string): void {
    const l = this.log.fn('init', { entityGuid });

    const item = this.itemService.getItem(entityGuid);
    this.#item.set(item);
    const contentType = this.#contentType();
    const slotIsEmpty = this.itemService.slotIsEmpty(entityGuid);

    this.formulaPromises.init(entityGuid, this.#contentType, this, this.changeBroadcastSvc);
    this.formulaEngine.init(entityGuid, this, this.formulaPromises, contentType, this.contentTypeSettings);
    this.changeBroadcastSvc.init(entityGuid, this.#contentType, this.entityReader, slotIsEmpty);


    // Constant field parts which don't ever change.
    // They can only be created once the inputTypes and contentTypes are available
    this.constFieldPartsOfLanguage$ = this.constantsService
      .init(item, this.entityReader$, this.formConfig.language$, contentType)
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

    const logUpdateFieldProps = this.log.rxTap('updateFieldProps', { enabled: true });
    this.subscriptions.add(
      combineLatest([
        this.itemAttributes$,
        this.entityReader$,
        this.forceRefreshSettings$,
        this.constFieldPartsOfLanguage$,
        prepared$,
        // temp solution for slotIsEmpty - needed ATM, otherwise formulas don't run when the slot-setting changes
        this.itemService.getItemHeader$(entityGuid),
      ]).pipe(
        logUpdateFieldProps.pipe(),
        map(([itemAttributes, entityReader, _, constantFieldParts, prepared]) => {
          // 1. Create list of all current language form values (as is stored in the entity-store) for further processing
          const formValues = entityReader.currentValues(itemAttributes);

          // 2. Process the queue of changes from promises if necessary
          // If things change, we will exit because then the observable will be retriggered
          const isFirstRound = Object.keys(this.latestFieldProps).length === 0;
          if (!isFirstRound) {
            const { newFieldProps, hadValueChanges } = this.formulaPromises
              .updateFromQueue(formValues, this.latestFieldProps, constantFieldParts, prepared.updHelperFactory);
            // If we only updated values from promise (queue), don't trigger property regular updates
            // NOTE: if any value changes then the entire cycle will automatically retrigger
            if (newFieldProps)
              this.latestFieldProps = newFieldProps;
            if (hadValueChanges)
              return null;
          }

          // 3. Run formulas for all fields - as a side effect (not nice) will also get / init all field settings
          const { fieldsProps, valueUpdates, fieldUpdates } = this.formulaEngine
            .runFormulasForAllFields(item, itemAttributes, constantFieldParts, formValues, entityReader, prepared.updHelperFactory);

          // 4. On first cycle, also make sure we have the wrappers specified as it's needed by the field creator; otherwise preserve previous
          for (const [key, value] of Object.entries(fieldsProps))
            value.buildWrappers = isFirstRound
              ? WrapperHelper.getWrappers(value.settings, value.constants.inputCalc)
              : this.latestFieldProps[key]?.buildWrappers;

          // 5. Update the latest field properties for further cycles
          this.latestFieldProps = fieldsProps;

          // 6.1 If we have value changes were applied
          const changesWereApplied = this.changeBroadcastSvc.applyValueChangesFromFormulas(
            formValues,
            fieldsProps,
            valueUpdates,
            fieldUpdates,
          );

          // 6.2 If changes had been made before, do not trigger field property updates yet, but wait for the next cycle
          if (changesWereApplied)
            return null;

          // 6.3 If no more changes were applied, then trigger field property updates and reset the loop counter
          this.changeBroadcastSvc.valueFormulaCounter = 0;
          return fieldsProps;
        }),
        logUpdateFieldProps.map(),
        filter(fieldsProps => !!fieldsProps), // filter out nulls to skip/not process
        logUpdateFieldProps.filter(),
      ).subscribe(fieldsProps => {
        this.log.a('fieldsProps', JSON.parse(JSON.stringify(fieldsProps)));
        this.fieldsProps$.next(fieldsProps);
      })
    );
  }

  /**
   * Get latest/current valid field settings - if possible from cache
   * if the currentLanguage changed then we need to flush the settings with initial ones that have updated language
   */
  getLatestFieldSettings(constFieldPart: FieldConstantsOfLanguage): FieldSettings {
    const latestProps = this.latestFieldProps[constFieldPart.fieldName];
    // if the currentLanguage changed then we need to flush the settings with initial ones that have updated language
    const cachedLanguageUnchanged = constFieldPart.language == latestProps?.language;
    const latestSettings: FieldSettings = cachedLanguageUnchanged
      ? latestProps?.settings ?? { ...constFieldPart.settingsInitial }
      : { ...constFieldPart.settingsInitial };
    return latestSettings;
  }

  //TODO: @2dm -> Here we call the formula engine to process the picker items
  //TODO: @SDV -> Possible issue here as all pickers use same instance of this service, when we have multiple pickers we could get data crosscontamination
  //           -> Consider multiple streams (one for each picker)
  processPickerItems$(fieldName: string, availableItems$: BehaviorSubject<PickerItem[]>): Observable<PickerItem[]> {
    return combineLatest([
      availableItems$,
      this.itemAttributes$,
      this.entityReader$,
      this.constFieldPartsOfLanguage$,
    ]).pipe(map(([
        availableItems, itemAttributes, entityReader, constantFieldParts,
      ]) => {
        const contentType = this.#contentType();
        const attribute = contentType.Attributes.find(a => a.Name === fieldName);
        const formValues: ItemValuesOfLanguage = {};
        for (const [fieldName, fieldValues] of Object.entries(itemAttributes)) {
          formValues[fieldName] = entityReader.getBestValue(fieldValues, null);
        }
        const constantFieldPart = constantFieldParts.find(f => f.fieldName === attribute.Name);
        const latestSettings = this.getLatestFieldSettings(constantFieldPart);

        return this.formulaEngine.runAllListItemsFormulas(
          attribute.Name,
          formValues,
          constantFieldPart.inputTypeStrict,
          constantFieldPart.settingsInitial,
          latestSettings,
          this.#item().Header,
          availableItems
        );
      }
    ));
  }

  /**
   * Used to get field properties for all fields.
   * @returns Object that has attribute name as a key and all of its field properties as a value
   */
  getFieldsProps(): FieldsProps {
    return this.fieldsProps$.value;
  }

  /**
   * Used to get field properties stream for all fields.
   * @returns Stream of objects that has attribute name as a key and all of its field properties as a value
   */
  getFieldsProps$(): Observable<FieldsProps> {
    return this.fieldsProps$.asObservable();
  }

  /**
   * Used for getting field settings for a specific field.
   * @param fieldName
   * @returns Field settings
   */
  getFieldSettings(fieldName: string): FieldSettings {
    return this.fieldsProps$.value[fieldName].settings;
  }

  /**
   * Used for getting field settings stream for a specific field.
   * @param fieldName
   * @returns Field settings stream
   */
  getFieldSettings$(fieldName: string): Observable<FieldSettings> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].settings),
      mapUntilObjChanged(m => m),
      // 2024-08-19 2dm changed to always replay; monitor in case we run into trouble
      shareReplay(1),
    );
  }

  getFieldSettingsSignal(fieldName: string): Signal<FieldSettings> {
    const cached = this.signalsCache[fieldName];
    if (cached) return cached;
    var obs = this.getFieldSettings$(fieldName);
    return this.signalsCache[fieldName] = toSignal(obs); // note: no initial value, it should always be up-to-date
  }
  private signalsCache: Record<string, Signal<FieldSettings>> = {};

  /**
   * Used for translation state stream for a specific field.
   * @param fieldName
   * @returns Translation state stream
   */
  getTranslationState$(fieldName: string): Observable<TranslationState> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].translationState),
      mapUntilObjChanged(m => m),
    );
  }

  /**
   * Triggers a reevaluation of all formulas.
   */
  retriggerFormulas(): void {
    this.forceRefreshSettings$.next();
  }

  updateSetting(fieldName: string, update: Partial<FieldSettings>): void {
    const props = this.latestFieldProps[fieldName];
    const newSettings = { ...props.settings, ...update };
    const newProps = {
      ...this.latestFieldProps,
      [fieldName]: { ...props, settings: newSettings }
    };
    this.fieldsProps$.next(newProps);

    // Experimental: had trouble with the _isDialog / Collapsed properties not being persisted
    // since the latestFieldProps never had the value originally
    this.latestFieldProps = newProps;
  }
}
