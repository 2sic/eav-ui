import { Injectable, OnDestroy, signal, Signal } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, Observable, shareReplay } from 'rxjs';
import { FormConfigService } from '.';
import { FieldSettings, PickerItem } from '../../../../../../edit-types';
import { FieldLogicTools } from '../../form/shared/field-logic/field-logic-tools';
import { FormulaEngine } from '../../formulas/formula-engine';
import { EntityReader, FieldsSettingsHelpers, InputFieldHelpers } from '../helpers';
import { ContentTypeSettings, FieldConstantsOfLanguage, FieldsProps, FormValues, TranslationState } from '../models';
import { ContentTypeItemService, ContentTypeService, GlobalConfigService, ItemService, LanguageInstanceService } from '../store/ngrx-data';
import { FormsStateService } from './forms-state.service';
import { FormulaPromiseResult } from '../../formulas/models/formula-promise-result.model';
import { FieldValuePair } from '../../formulas/models/formula-results.models';
import { FormItemFormulaService } from '../../formulas/form-item-formula.service';
import { FormulaPromiseHandler } from '../../formulas/formula-promise-handler';
import { ItemFieldVisibility } from './item-field-visibility';
import { EavContentType, EavEntityAttributes } from '../models/eav';
import { ItemIdentifierHeader } from '../../../shared/models/edit-form.model';
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
  private contentTypeSettings$ = new BehaviorSubject<ContentTypeSettings>(null);
  public contentTypeSettings = signal<ContentTypeSettings>(null);
  private fieldsProps$ = new BehaviorSubject<FieldsProps>(null);
  private forceRefreshSettings$ = new BehaviorSubject<void>(null);
  public updateValueQueue: Record<string, FormulaPromiseResult> = {};
  private latestFieldProps: FieldsProps = {};
  private itemFieldVisibility: ItemFieldVisibility;

  private contentType$ = new Observable<EavContentType>();
  private itemAttributes$ = new Observable<EavEntityAttributes>();
  private entityReader$ = new Observable<EntityReader>();
  private constFieldPartsOfLanguage$ = new Observable<FieldConstantsOfLanguage[]>();
  private itemHeader: ItemIdentifierHeader;
  private entityGuid: string;

  private constantsService = transient(FieldsSettingsConstantsService);

  constructor(
    private languageSvc: LanguageInstanceService,
    private globalConfigService: GlobalConfigService,
    private formConfig: FormConfigService,
    private formsStateService: FormsStateService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private contentTypeItemService: ContentTypeItemService,
    private formulaEngine: FormulaEngine,
    private formItemFormulaService: FormItemFormulaService,
    private formulaPromiseHandler: FormulaPromiseHandler,
  ) {
    super(new EavLogger(nameOfThis, logThis));
    formulaPromiseHandler.init(this);
    formItemFormulaService.init(this.itemService);
    formulaEngine.init(this, this.formulaPromiseHandler, this.contentTypeSettings);
  }

  ngOnDestroy(): void {
    this.contentTypeSettings$?.complete();
    this.fieldsProps$?.complete();
    this.forceRefreshSettings$?.complete();
    super.destroy();
  }

  init(entityGuid: string): void {
    const l = this.log.fn('init', { entityGuid });

    this.entityGuid = entityGuid;

    const item = this.itemService.getItem(entityGuid);
    this.itemFieldVisibility = new ItemFieldVisibility(item.Header);
    const contentTypeNameId = InputFieldHelpers.getContentTypeNameId(item);
    this.contentType$ = this.contentTypeService.getContentType$(contentTypeNameId);
    const contentType = this.contentTypeService.getContentType(contentTypeNameId);
    this.itemHeader = item.Header;
    this.entityReader$ = this.languageSvc.getEntityReader$(this.formConfig.config.formId);

    this.subscriptions.add(
      this.entityReader$.pipe(
        map(entityReader => {
          const ctSettings = FieldsSettingsHelpers.setDefaultContentTypeSettings(
            entityReader.flattenAll<ContentTypeSettings>(contentType.Metadata),
            contentType,
            entityReader,
            item.Header,
          );
          return ctSettings;
        }),
      ).subscribe(ctSettings => {
        this.contentTypeSettings$.next(ctSettings);
        this.contentTypeSettings.set(ctSettings);
      })
    );

    const entityId = item.Entity.Id;

    const conSvc = this.constantsService;
    conSvc.init(this.itemFieldVisibility, this.entityReader$, this.formConfig.language$, contentType);

    // Constant field parts which don't ever change.
    // They can only be created once the inputTypes and contentTypes are available
    let constFieldParts = conSvc.getConstantFieldParts(entityGuid, entityId, contentTypeNameId);

    this.constFieldPartsOfLanguage$ = conSvc.getConstantFieldPartsOfLanguage$(constFieldParts);

    // WIP trying to drop this observabse, but surprisingly it fails...
    this.itemAttributes$ = this.itemService.getItemAttributes$(entityGuid);
    const formReadOnly$ = this.formsStateService.readOnly$;
    const debugEnabled$ = this.globalConfigService.debugEnabled$;

    const logUpdateFieldProps = this.log.rxTap('updateFieldProps', { enabled: true });
    this.subscriptions.add(
      combineLatest([
        this.itemAttributes$,
        this.entityReader$,
        formReadOnly$,
        this.forceRefreshSettings$,
        debugEnabled$,
        this.constFieldPartsOfLanguage$
      ]).pipe(
        logUpdateFieldProps.pipe(),
        map(([
          itemAttributes,
          entityReader,
          formReadOnly,
          _,
          debugEnabled,
          constantFieldParts
        ]) => {
          const formValues: FormValues = {};
          for (const [fieldName, fieldValues] of Object.entries(itemAttributes))
            formValues[fieldName] = entityReader.getBestValue(fieldValues, null);

          const slotIsEmpty = this.itemHeader.IsEmptyAllowed && this.itemHeader.IsEmpty;

          const logicTools: FieldLogicTools = {
            eavConfig: this.formConfig.config,
            entityReader,
            debug: debugEnabled,
            contentTypeItemService: this.contentTypeItemService,
          };

          // This factory will generate helpers to validate settings updates
          const setUpdHelperFactory = new FieldSettingsUpdateHelperFactory(
            contentType.Metadata,
            entityReader, // for languages
            logicTools,
            formReadOnly.isReadOnly,
            slotIsEmpty,
          );

          // Process the queue of changes from promises if necessary
          // If things change, we will exit because then the observable will be retriggered
          if (Object.keys(this.latestFieldProps).length) {
            const { newFieldProps, valuesUpdated } = this.formulaPromiseHandler.updateValuesFromQueue(
              entityGuid,
              this.updateValueQueue,
              contentType,
              formValues,
              this.latestFieldProps,
              slotIsEmpty,
              entityReader,
              this.latestFieldProps,
              contentType.Attributes,
              constantFieldParts,
              itemAttributes,
              this.formItemFormulaService,
              setUpdHelperFactory,
            );
            // we only updated values from promise (queue), don't trigger property regular updates
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

          for (const attribute of contentType.Attributes) {
            const attributeValues = itemAttributes[attribute.Name];
            // empty-default and empty-message have no value
            const valueBefore = formValues[attribute.Name];

            const constantFieldPart = constantFieldParts.find(f => f.fieldName === attribute.Name);

            // if the currentLanguage changed then we need to flush the settings with initial ones that have updated language
            let latestSettings: FieldSettings;
            if (constantFieldPart.currentLanguage == this.latestFieldProps[attribute.Name]?.currentLanguage) {
              latestSettings = this.latestFieldProps[attribute.Name]?.settings
                ?? { ...constantFieldPart.settingsInitial };
            } else {
              latestSettings = { ...constantFieldPart.settingsInitial };
            }

            const settingsUpdateHelper = setUpdHelperFactory.create(
              attribute, constantFieldPart, attributeValues
            );

            // run formulas
            const formulaResult = this.formulaEngine.runAllFormulasOfField(
              entityGuid, attribute, formValues,
              constantFieldPart.inputTypeStrict,
              constantFieldPart.settingsInitial,
              latestSettings,
              this.itemHeader,
              valueBefore,
              reuseObjectsForFormulaDataAndContext,
              settingsUpdateHelper,
            );

            const fixed = formulaResult.settings;

            possibleValueUpdates[attribute.Name] = formulaResult.value;
            if (formulaResult.fields)
              possibleFieldsUpdates.push(...formulaResult.fields);

            const fieldTranslation = FieldsSettingsHelpers.getTranslationState(attributeValues, fixed.DisableTranslation, entityReader);
            const wrappers = InputFieldHelpers.getWrappers(fixed, constantFieldPart.inputType);

            fieldsProps[attribute.Name] = {
              calculatedInputType: constantFieldPart.inputType,
              constants: constantFieldPart, //.constants,
              settings: fixed,
              translationState: fieldTranslation,
              value: valueBefore,
              wrappers,
              formulaValidation: formulaResult.validation,
              currentLanguage: constantFieldPart.currentLanguage,
            };
          }
          this.latestFieldProps = fieldsProps;

          // if changes were applied do not trigger field property updates yet, but wait for the next cycle
          const changesWereApplied = this.formItemFormulaService.applyValueChangesFromFormulas(
            entityGuid, contentType, formValues, fieldsProps,
            possibleValueUpdates, possibleFieldsUpdates,
            slotIsEmpty, entityReader);
          if (changesWereApplied)
            return null;

          // if no changes were applied then we trigger field property updates and reset the loop counter
          this.formItemFormulaService.valueFormulaCounter = 0;
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

  //TODO: @2dm -> Here we call the formula engine to process the picker items
  //TODO: @SDV -> Possible issue here as all pickers use same instance of this service, when we have multiple pickers we could get data crosscontamination
  //           -> Consider multiple streams (one for each picker)
  processPickerItems$(fieldName: string, availableItems$: BehaviorSubject<PickerItem[]>): Observable<PickerItem[]> {
    return combineLatest([
      availableItems$,
      this.contentType$,
      this.itemAttributes$,
      this.entityReader$,
      this.constFieldPartsOfLanguage$,
    ]).pipe(map(([
        availableItems, contentType, itemAttributes, entityReader, constantFieldParts,
      ]) => {
        const attribute = contentType.Attributes.find(a => a.Name === fieldName);
        const formValues: FormValues = {};
        for (const [fieldName, fieldValues] of Object.entries(itemAttributes)) {
          formValues[fieldName] = entityReader.getBestValue(fieldValues, null);
        }
        const constantFieldPart = constantFieldParts.find(f => f.fieldName === attribute.Name);
        let latestSettings: FieldSettings;
        if (constantFieldPart.currentLanguage == this.latestFieldProps[attribute.Name]?.currentLanguage) {
          latestSettings = this.latestFieldProps[attribute.Name]?.settings
            ?? { ...constantFieldPart.settingsInitial };
        } else {
          latestSettings = { ...constantFieldPart.settingsInitial };
        }
        return this.formulaEngine.runAllListItemsFormulas(
          this.entityGuid,
          attribute,
          formValues,
          constantFieldPart.inputTypeStrict,
          constantFieldPart.settingsInitial,
          latestSettings,
          this.itemHeader,
          availableItems
        );
      }
    ));
  }

  /**
   * Used to get content type settings.
   * @returns Content type settings
   */
  getContentTypeSettings(): ContentTypeSettings {
    return this.contentTypeSettings();
  }

  /**
   * Used to get content type settings stream.
   * @returns Stream of content type settings
   */
  getContentTypeSettings$(): Observable<ContentTypeSettings> {
    return this.contentTypeSettings$.asObservable();
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
    );
  }

  // todo: probably switch all uses above to this one
  getFieldSettingsReplayed$(fieldName: string): Observable<FieldSettings> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].settings),
      mapUntilObjChanged(m => m),
      shareReplay(1),
    );
  }

  getFieldSettingsSignal(fieldName: string): Signal<FieldSettings> {
    const cached = this.signalsCache[fieldName];
    if (cached) return cached;

    var obs = this.getFieldSettingsReplayed$(fieldName);
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
