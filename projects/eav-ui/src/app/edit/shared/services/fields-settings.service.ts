import { computed, inject, Injectable, OnDestroy, signal, Signal } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, Observable, shareReplay } from 'rxjs';
import { FormConfigService } from '.';
import { FieldSettings, PickerItem } from '../../../../../../edit-types';
import { FieldLogicTools } from '../../form/shared/field-logic/field-logic-tools';
import { FormulaEngine } from '../../formulas/formula-engine';
import { ContentTypeSettingsHelpers, FieldsSettingsHelpers, InputFieldHelpers } from '../helpers';
import { FieldConstantsOfLanguage, FieldsProps, FormValues, TranslationState } from '../models';
import { ContentTypeItemService, ContentTypeService, GlobalConfigService, ItemService, LanguageInstanceService } from '../store/ngrx-data';
import { FormsStateService } from './forms-state.service';
import { FieldValuePair } from '../../formulas/models/formula-results.models';
import { ItemFormulaBroadcastService } from '../../formulas/form-item-formula.service';
import { FormulaPromiseHandler } from '../../formulas/formula-promise-handler';
import { EavEntityAttributes, EavItem } from '../models/eav';
import { toSignal } from '@angular/core/rxjs-interop';
import { ServiceBase } from '../../../shared/services/service-base';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { mapUntilObjChanged } from '../../../shared/rxJs/mapUntilChanged';
import { FieldSettingsUpdateHelperFactory } from '../helpers/fields-settings-update.helpers';
import { FieldsSettingsConstantsService } from './fields-settings-constants.service';
import { transient } from '../../../core';

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

  private fieldsProps$ = new BehaviorSubject<FieldsProps>(null);
  private forceRefreshSettings$ = new BehaviorSubject<void>(null);
  private latestFieldProps: FieldsProps = {};

  private itemAttributes$ = new Observable<EavEntityAttributes>();

  private entityReader$ = this.languageSvc.getEntityReader$(this.formConfig.config.formId);
  private entityReader = this.languageSvc.getEntityReader(this.formConfig.config.formId);

  private constFieldPartsOfLanguage$ = new Observable<FieldConstantsOfLanguage[]>();

  private constantsService = transient(FieldsSettingsConstantsService);
  private changeBroadcastSvc = transient(ItemFormulaBroadcastService);
  private formulaEngine = transient(FormulaEngine);
  private formulaPromises = transient(FormulaPromiseHandler);

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
    const contentTypeNameId = InputFieldHelpers.getContentTypeNameId(this.#item());
    const contentType = this.contentTypeService.getContentType(contentTypeNameId);
    return contentType;
  });

  /** The settings of the content-type of this item */
  contentTypeSettings = computed(() => !this.#item()
    ? null
    : ContentTypeSettingsHelpers.initDefaultSettings(this.entityReader(), this.#contentType(), this.#item().Header));

  /** Start the observables etc. to monitor changes */
  init(entityGuid: string): void {
    const l = this.log.fn('init', { entityGuid });

    const item = this.itemService.getItem(entityGuid);
    this.#item.set(item);

    this.formulaPromises.init(entityGuid, this.#contentType, this, this.changeBroadcastSvc);
    this.formulaEngine.init(entityGuid, this, this.formulaPromises, this.contentTypeSettings);
    this.changeBroadcastSvc.init(entityGuid, this.#contentType, this.entityReader);

    const contentType = this.#contentType();

    // Constant field parts which don't ever change.
    // They can only be created once the inputTypes and contentTypes are available
    const entityReader$ = this.entityReader$;
    const conSvc = this.constantsService;
    conSvc.init(item, entityReader$, this.formConfig.language$, contentType);
    let constFieldParts = conSvc.getConstantFieldParts(entityGuid, item.Entity.Id, contentType.Id);
    this.constFieldPartsOfLanguage$ = conSvc.getConstantFieldPartsOfLanguage$(constFieldParts);

    // WIP trying to drop this observable, but surprisingly it fails...
    this.itemAttributes$ = this.itemService.getItemAttributes$(entityGuid);

    // Prepare / build FieldLogicTools for use in all the formulas / field settings updates
    const prepared$ = combineLatest([
      this.itemService.getItemHeader$(entityGuid),  // must watch, as the IsEmpty can be toggled
      this.entityReader$, // also exists as signal
      this.globalConfigService.debugEnabled$, // also exists as signal
      this.formsStateService.readOnly$, // also exists as signal
    ]).pipe(
      map(([itemHeader, entityReader, debugEnabled, formReadOnly]) => {
        const slotIsEmpty = itemHeader.IsEmptyAllowed && itemHeader.IsEmpty;
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
          slotIsEmpty,
          logicTools,
          updHelperFactory,
        };
      })

    );

    const logUpdateFieldProps = this.log.rxTap('updateFieldProps', { enabled: true });
    this.subscriptions.add(
      combineLatest([
        this.itemAttributes$,
        entityReader$,
        this.forceRefreshSettings$,
        this.constFieldPartsOfLanguage$,
        prepared$,
      ]).pipe(
        logUpdateFieldProps.pipe(),
        map(([itemAttributes, entityReader, _, constantFieldParts, prepared]) => {

          // Create list of all current form values for further processing
          const formValues: FormValues = {};
          for (const [fieldName, fieldValues] of Object.entries(itemAttributes))
            formValues[fieldName] = entityReader.getBestValue(fieldValues, null);

          // Process the queue of changes from promises if necessary
          // If things change, we will exit because then the observable will be retriggered
          if (Object.keys(this.latestFieldProps).length) {
            const { newFieldProps, valuesUpdated } = this.formulaPromises.updateValuesFromQueue(
              formValues,
              this.latestFieldProps,
              prepared.slotIsEmpty,
              constantFieldParts,
              itemAttributes,
              prepared.updHelperFactory,
            );
            // If we only updated values from promise (queue), don't trigger property regular updates
            // NOTE: if any value changes then the entire cycle will automatically retrigger
            if (newFieldProps)
              this.latestFieldProps = newFieldProps;
            if (valuesUpdated)
              return null;
          }

          const fieldsProps: FieldsProps = {};
          const possibleValueUpdates: FormValues = {};
          const possibleFieldsUpdates: FieldValuePair[] = [];

          // Many aspects of a field are re-usable across formulas, so we prepare them here
          // These are things explicit to the entity and either never change, or only rarely
          // so never between cycles
          const reuseObjectsForFormulaDataAndContext = this.formulaEngine.prepareDataForFormulaObjects(entityGuid);

          for (const attr of contentType.Attributes) {
            const attrValues = itemAttributes[attr.Name];
            const valueBefore = formValues[attr.Name];
            const constFieldPart = constantFieldParts.find(f => f.fieldName === attr.Name);

            const latestSettings: FieldSettings = this.getLatestFieldSettings(constFieldPart);

            const settingsUpdateHelper = prepared.updHelperFactory.create(attr, constFieldPart, attrValues);

            // run formulas
            const formulaResult = this.formulaEngine.runAllFormulasOfField(
              attr,
              formValues,
              constFieldPart,
              latestSettings,
              item.Header,
              valueBefore,
              reuseObjectsForFormulaDataAndContext,
              settingsUpdateHelper,
            );

            const fixed = formulaResult.settings;

            possibleValueUpdates[attr.Name] = formulaResult.value;
            if (formulaResult.fields)
              possibleFieldsUpdates.push(...formulaResult.fields);

            const fieldTranslation = FieldsSettingsHelpers.getTranslationState(attrValues, fixed.DisableTranslation, entityReader);
            const wrappers = InputFieldHelpers.getWrappers(fixed, constFieldPart.inputType);

            fieldsProps[attr.Name] = {
              calculatedInputType: constFieldPart.inputType,
              constants: constFieldPart,
              settings: fixed,
              translationState: fieldTranslation,
              value: valueBefore,
              wrappers,
              formulaValidation: formulaResult.validation,
              language: constFieldPart.language,
            };
          }

          this.latestFieldProps = fieldsProps;

          // if changes were applied do not trigger field property updates yet, but wait for the next cycle
          const changesWereApplied = this.changeBroadcastSvc.applyValueChangesFromFormulas(
            formValues,
            fieldsProps,
            possibleValueUpdates,
            possibleFieldsUpdates,
            prepared.slotIsEmpty
          );
          if (changesWereApplied)
            return null;

          // if no changes were applied then we trigger field property updates and reset the loop counter
          this.changeBroadcastSvc.valueFormulaCounter = 0;
          return fieldsProps;
        }),
        logUpdateFieldProps.map(),
        filter(fieldsProps => !!fieldsProps),
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
  private getLatestFieldSettings(constFieldPart: FieldConstantsOfLanguage): FieldSettings {
    const fieldName = constFieldPart.fieldName;
    // if the currentLanguage changed then we need to flush the settings with initial ones that have updated language
    const cachedLanguageUnchanged = constFieldPart.language == this.latestFieldProps[fieldName]?.language;
    const latestSettings: FieldSettings = cachedLanguageUnchanged
      ? this.latestFieldProps[fieldName]?.settings
        ?? { ...constFieldPart.settingsInitial }
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
        const formValues: FormValues = {};
        for (const [fieldName, fieldValues] of Object.entries(itemAttributes)) {
          formValues[fieldName] = entityReader.getBestValue(fieldValues, null);
        }
        const constantFieldPart = constantFieldParts.find(f => f.fieldName === attribute.Name);
        const latestSettings = this.getLatestFieldSettings(constantFieldPart);

        return this.formulaEngine.runAllListItemsFormulas(
          attribute,
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
