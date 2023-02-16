import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { consoleLogWebpack } from 'projects/field-custom-gps/src/shared/console-log-webpack.helper';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, Subscription } from 'rxjs';
import { EavService, EditInitializerService, LoggingService } from '.';
import { FieldSettings, FieldValue, FormulaResultRaw } from '../../../../../../edit-types';
import { DataTypeConstants } from '../../../content-type-fields/constants/data-type.constants';
import { InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { FeatureSummary } from '../../../features/models';
import { consoleLogAngular } from '../../../shared/helpers/console-log-angular.helper';
import { FeaturesService } from '../../../shared/services/features.service';
import { FieldLogicManager } from '../../form/shared/field-logic/field-logic-manager';
import { FieldLogicTools } from '../../form/shared/field-logic/field-logic-tools';
// tslint:disable-next-line:max-line-length
import { EntityReader, FieldsSettingsHelpers, FormulaHelpers, GeneralHelpers, InputFieldHelpers, ValidationHelpers } from '../helpers';
// tslint:disable-next-line:max-line-length
import { ContentTypeSettings, FieldsProps, FormulaCacheItem, FormulaFieldValidation, FormulaFunctionDefault, FormulaFunctionV1, FormulaTarget, FormulaTargets, FormulaVersions, FormValues, LogSeverities, RunFormulasResult, SettingsFormulaPrefix, TranslationState } from '../models';
import { EavHeader } from '../models/eav';
// tslint:disable-next-line:max-line-length
import { ContentTypeService, GlobalConfigService, InputTypeService, ItemService, LanguageInstanceService, LanguageService } from '../store/ngrx-data';
import { FormsStateService } from './forms-state.service';
import { FormulaDesignerService } from './formula-designer.service';

@Injectable()
export class FieldsSettingsService implements OnDestroy {
  private contentTypeSettings$: BehaviorSubject<ContentTypeSettings>;
  private fieldsProps$: BehaviorSubject<FieldsProps>;
  private forceRefreshSettings$: BehaviorSubject<void>;
  private subscription: Subscription;
  private valueFormulaCounter = 0;
  private maxValueFormulaCycles = 5;
  private formulaSettingsCache: Record<string, FieldSettings> = {};
  private featuresCache$ = new BehaviorSubject<FeatureSummary[]>([]);

  constructor(
    private contentTypeService: ContentTypeService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private languageService: LanguageService,
    private formulaDesignerService: FormulaDesignerService,
    private loggingService: LoggingService,
    private translate: TranslateService,
    private globalConfigService: GlobalConfigService,
    private editInitializerService: EditInitializerService,
    private formsStateService: FormsStateService,
    private featuresService: FeaturesService,
  ) { }

  ngOnDestroy(): void {
    this.contentTypeSettings$?.complete();
    this.fieldsProps$?.complete();
    this.forceRefreshSettings$?.complete();
    this.subscription?.unsubscribe();
  }

  init(entityGuid: string): void {
    this.subscription = new Subscription();
    this.contentTypeSettings$ = new BehaviorSubject(null);
    this.fieldsProps$ = new BehaviorSubject(null);
    this.forceRefreshSettings$ = new BehaviorSubject(null);

    const item = this.itemService.getItem(entityGuid);
    const entityId = item.Entity.Id;
    const contentTypeId = InputFieldHelpers.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentType$(contentTypeId);
    const itemHeader$ = this.itemService.getItemHeader$(entityGuid);

    this.subscription.add(this.featuresService.getAll$().subscribe(this.featuresCache$));
    const entityReader$ = this.languageInstanceService.getEntityReader$(this.eavService.eavConfig.formId);

    this.subscription.add(
      combineLatest([contentType$, itemHeader$, entityReader$]).pipe(
        map(([contentType, itemHeader, entityReader]) => {
          const ctSettings = FieldsSettingsHelpers.setDefaultContentTypeSettings(
            entityReader.flattenAll<ContentTypeSettings>(contentType.Metadata),
            contentType,
            entityReader.currentLanguage,
            entityReader.defaultLanguage,
            itemHeader,
          );
          return ctSettings;
        }),
      ).subscribe(ctSettings => {
        this.contentTypeSettings$.next(ctSettings);
      })
    );

    const itemAttributes$ = this.itemService.getItemAttributes$(entityGuid);
    const inputTypes$ = this.inputTypeService.getInputTypes$();
    const readOnly$ = this.formsStateService.readOnly$;
    const debugEnabled$ = this.globalConfigService.getDebugEnabled$();

    const constantFieldParts$ = combineLatest([inputTypes$, contentType$, entityReader$]).pipe(
      map(([inputTypes, contentType, entityReader]) => {
        return contentType.Attributes.map((attribute, index) => {
          const initialSettings = FieldsSettingsHelpers.setDefaultFieldSettings(
            // TODO: unclear why we're not using the current language but the default
            new EntityReader(this.eavService.eavConfig.lang, entityReader.defaultLanguage).flattenAll<FieldSettings>(attribute.Metadata)
            // FieldsSettingsHelpers.mergeSettings<FieldSettings>(attribute.Metadata, this.eavService.eavConfig.lang, defaultLanguage),
          );
          const initialDisabled = initialSettings.Disabled ?? false;
          const calculatedInputType = InputFieldHelpers.calculateInputType(attribute, inputTypes);
          const inputType = inputTypes.find(i => i.Type === attribute.InputType);

          const mergeRaw = entityReader.flattenAll<FieldSettings>(attribute.Metadata);
          // Sometimes the metadata doesn't have the input type (empty string), so we'll add the attribute.InputType just in case...
          mergeRaw.InputType = attribute.InputType;
          const merged = FieldsSettingsHelpers.setDefaultFieldSettings(mergeRaw);
          consoleLogAngular('merged', JSON.parse(JSON.stringify(merged)));

          const logic = FieldLogicManager.singleton().get(attribute.InputType);

          return ({
            logic,
            merged,
            inputType,
            calculatedInputType,
            constants: {
              angularAssets: inputType?.AngularAssets,
              contentTypeId,
              dropzonePreviewsClass: `dropzone-previews-${this.eavService.eavConfig.formId}-${index}`,
              entityGuid,
              entityId,
              fieldName: attribute.Name,
              index,
              initialDisabled,
              inputType: calculatedInputType.inputType,
              isExternal: calculatedInputType.isExternal,
              isLastInGroup: FieldsSettingsHelpers.findIsLastInGroup(contentType, attribute),
              type: attribute.Type,
            }
          });
        });
      }));

    this.subscription.add(
      combineLatest([
        contentType$, itemAttributes$, itemHeader$, entityReader$,
        readOnly$, this.forceRefreshSettings$, debugEnabled$, constantFieldParts$
      ]).pipe(
        map(([
          contentType, itemAttributes, itemHeader, entityReader,
          readOnly, _, debugEnabled, constantFieldParts
        ]) => {
          const formValues: FormValues = {};
          for (const [fieldName, fieldValues] of Object.entries(itemAttributes)) {
            formValues[fieldName] = entityReader.getBestValue(fieldValues, null);
          }

          const fieldsProps: FieldsProps = {};
          const valueUpdates: FormValues = {};
          const possibleValueUpdates: FormValues = {};
          const possibleAditionalValueUpdates: FormValues = {};
          const logicTools: FieldLogicTools = {
            eavConfig: this.eavService.eavConfig,
            entityReader,
            debug: debugEnabled,
          };
          const slotIsEmpty = itemHeader.IsEmptyAllowed && itemHeader.IsEmpty;
          for (const attribute of contentType.Attributes) {
            const attributeValues = itemAttributes[attribute.Name];
            // empty-default and empty-message have no value
            const valueBefore = formValues[attribute.Name];

            const constantFieldPart = constantFieldParts.find(f => f.constants.fieldName === attribute.Name);

            // run formulas
            const formulaResult = this.runFormulas(entityGuid, entityId, attribute.Name, formValues, constantFieldPart.inputType, constantFieldPart.merged, itemHeader);

            // ensure new settings match requirements
            const newSettings = formulaResult.settings;
            newSettings.Name = newSettings.Name || attribute.Name;
            newSettings.Required = ValidationHelpers.isRequired(newSettings);
            const disableTranslation = FieldsSettingsHelpers.findDisableTranslation(
              contentType.Metadata, constantFieldPart.inputType, attributeValues, entityReader.defaultLanguage, attribute.Metadata,
            );
            newSettings.DisableTranslation = slotIsEmpty || disableTranslation;
            newSettings._disabledBecauseOfTranslation = FieldsSettingsHelpers.getDisabledBecauseTranslations(
              attributeValues, newSettings.DisableTranslation, entityReader.currentLanguage, entityReader.defaultLanguage,
            );
            newSettings.Disabled = newSettings.Disabled || slotIsEmpty || newSettings._disabledBecauseOfTranslation || readOnly.isReadOnly;
            newSettings.DisableAutoTranslation = newSettings.DisableAutoTranslation || newSettings.DisableTranslation;

            // update settings with respective FieldLogics
            const fixed = constantFieldPart.logic?.update(newSettings, valueBefore, logicTools) ?? newSettings;
            consoleLogAngular('newSettings', JSON.parse(JSON.stringify(newSettings)));

            possibleValueUpdates[attribute.Name] = formulaResult.value;
            if (Object.keys(formulaResult.additionalValues).length > 0) {
              for (const field in formulaResult.additionalValues) {
                possibleAditionalValueUpdates[field] = formulaResult.additionalValues[field];
              }
            }

            const fieldTranslation = FieldsSettingsHelpers.getTranslationState(
              attributeValues, fixed.DisableTranslation, entityReader.currentLanguage, entityReader.defaultLanguage,
            );
            const wrappers = InputFieldHelpers.getWrappers(fixed, constantFieldPart.calculatedInputType);

            fieldsProps[attribute.Name] = {
              calculatedInputType: constantFieldPart.calculatedInputType,
              constants: constantFieldPart.constants,
              settings: fixed,
              translationState: fieldTranslation,
              value: valueBefore,
              wrappers,
              formulaValidation: formulaResult.validation,
            };
          }

          for (const attribute of contentType.Attributes) {
            const valueBefore = formValues[attribute.Name];
            const valueFromFormula = possibleValueUpdates[attribute.Name];
            const aditionalValueFromFormula = possibleAditionalValueUpdates[attribute.Name];
            const newValue = aditionalValueFromFormula ? aditionalValueFromFormula : valueFromFormula;
            // console.log('SDV attribute:', attribute.Name, 'valueBefore:', valueBefore, 'valueFromFormula:', valueFromFormula, 'aditionalValueFromFormula:', aditionalValueFromFormula, 'newValue:', newValue);
            if (this.shouldUpdate(valueBefore, newValue, slotIsEmpty, fieldsProps[attribute.Name].settings._disabledBecauseOfTranslation)) {
              valueUpdates[attribute.Name] = newValue;
            }
          }

          // console.log('SDV valueUpdates', valueUpdates);

          if (Object.keys(valueUpdates).length > 0) {
            if (this.maxValueFormulaCycles > this.valueFormulaCounter) {
              this.valueFormulaCounter++;
              this.itemService.updateItemAttributesValues(
                entityGuid, valueUpdates, entityReader.currentLanguage, entityReader.defaultLanguage
              );
              // return nothing to make sure fieldProps are not updated yet
              return null;
            } else {
              consoleLogWebpack('Max value formula cycles reached');
            }
          }
          this.valueFormulaCounter = 0;
          return fieldsProps;
        }),
        filter(fieldsProps => !!fieldsProps),
      ).subscribe(fieldsProps => {
        this.fieldsProps$.next(fieldsProps);
      })
    );
  }

  getContentTypeSettings(): ContentTypeSettings {
    return this.contentTypeSettings$.value;
  }

  getContentTypeSettings$(): Observable<ContentTypeSettings> {
    return this.contentTypeSettings$.asObservable();
  }

  getFieldsProps(): FieldsProps {
    return this.fieldsProps$.value;
  }

  getFieldsProps$(): Observable<FieldsProps> {
    return this.fieldsProps$.asObservable();
  }

  getFieldSettings(fieldName: string): FieldSettings {
    return this.fieldsProps$.value[fieldName].settings;
  }

  getFieldSettings$(fieldName: string): Observable<FieldSettings> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].settings),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  getTranslationState$(fieldName: string): Observable<TranslationState> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].translationState),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  forceSettings(): void {
    this.forceRefreshSettings$.next();
  }

  private shouldUpdate(valueBefore: FieldValue, valueFromFormula: FieldValue, slotIsEmpty: boolean, disabledBecauseTranslations: boolean): boolean {
    // important to compare with undefined because null is allowed value
    if (slotIsEmpty || disabledBecauseTranslations || valueBefore === undefined || valueFromFormula === undefined)
      return false;
    
    let valuesNotEqual = valueBefore !== valueFromFormula;
    // do a more in depth comparison in case of calculated entity fields
    if (valuesNotEqual && Array.isArray(valueBefore) && Array.isArray(valueFromFormula)) {
      valuesNotEqual = !GeneralHelpers.arraysEqual(valueBefore as string[], valueFromFormula as string[]);
    }
    return valuesNotEqual;
  }

  private runFormulas(
    entityGuid: string,
    entityId: number,
    fieldName: string,
    formValues: FormValues,
    inputType: InputType,
    settings: FieldSettings,
    itemHeader: EavHeader,
  ): RunFormulasResult {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

    const previousSettings: FieldSettings = {
      ...settings,
      ...this.formulaSettingsCache[this.getFormulaSettingsKey(fieldName, currentLanguage, defaultLanguage)],
    };

    const formulas = this.formulaDesignerService.getFormulas(entityGuid, fieldName, null, false);
    let formulaValue: FieldValue;
    let formulaValidation: FormulaFieldValidation;
    let formulaResultAdditionalValues: Record<string, FieldValue> = {};
    const formulaSettings: Record<string, any> = {};
    for (const formula of formulas) {
      const formulaResult = this.runFormula(formula, entityId, formValues, inputType, settings, previousSettings, itemHeader);
      if (Object.keys(formulaResult.additionalValues).length > 0) {
        for (const field in formulaResult.additionalValues) {
          formulaResultAdditionalValues[field] = formulaResult.additionalValues[field];
        }
      }

      if (formulaResult.value === undefined) { continue; }

      if (formula.target === FormulaTargets.Value) {
        formulaValue = formulaResult.value;
        continue;
      }

      if (formula.target === FormulaTargets.Validation) {
        formulaValidation = formulaResult.value as unknown as FormulaFieldValidation;
        continue;
      }

      if (formula.target.startsWith(SettingsFormulaPrefix)) {
        const settingName = formula.target.substring(SettingsFormulaPrefix.length);
        const defaultSetting = (settings as Record<string, any>)[settingName];

        if (defaultSetting == null || formulaResult.value == null) {
          // can't check types, hope for the best
          formulaSettings[settingName] = formulaResult.value;
          continue;
        }

        if (Array.isArray(defaultSetting) && Array.isArray(formulaResult)) {
          // can't check types of items in array, hope for the best
          formulaSettings[settingName] = formulaResult.value;
          continue;
        }

        if (typeof defaultSetting === typeof formulaResult.value) {
          // maybe typesafe
          formulaSettings[settingName] = formulaResult.value;
          continue;
        }
      }
    }

    // save settings for the next cycle
    this.formulaSettingsCache[this.getFormulaSettingsKey(fieldName, currentLanguage, defaultLanguage)] = formulaSettings as FieldSettings;

    const formulaResult: RunFormulasResult = {
      settings: {
        ...settings,
        ...formulaSettings,
      },
      validation: formulaValidation,
      value: formulaValue,
      additionalValues: formulaResultAdditionalValues,
    };
    return formulaResult;
  }

  private getFormulaSettingsKey(fieldName: string, currentLanguage: string, defaultLanguage: string): string {
    return `fieldName:${fieldName}:currentLanguage:${currentLanguage}:defaultLanguage:${defaultLanguage}`;
  }

  private runFormula(
    formula: FormulaCacheItem,
    entityId: number,
    formValues: FormValues,
    inputType: InputType,
    settings: FieldSettings,
    previousSettings: FieldSettings,
    itemHeader: EavHeader,
  ): FormulaResultRaw {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    const languages = this.languageService.getLanguages();
    const debugEnabled = this.globalConfigService.getDebugEnabled();
    const initialFormValues = this.editInitializerService.getInitialValues(formula.entityGuid, currentLanguage);
    const formulaProps = FormulaHelpers.buildFormulaProps(
      formula,
      entityId,
      inputType,
      settings,
      previousSettings,
      formValues,
      initialFormValues,
      currentLanguage,
      defaultLanguage,
      languages,
      itemHeader,
      debugEnabled,
      this.itemService,
      this.eavService,
      this,
      this.featuresCache$.value,
    );
    const designerState = this.formulaDesignerService.getDesignerState();
    const isOpenInDesigner = designerState.isOpen
      && designerState.entityGuid === formula.entityGuid
      && designerState.fieldName === formula.fieldName
      && designerState.target === formula.target;
    const ctSettings = this.getContentTypeSettings();
    try {
      switch (formula.version) {
        case FormulaVersions.V1:
        case FormulaVersions.V2:
          if (isOpenInDesigner) {
            console.log(`Running formula${formula.version.toLocaleUpperCase()} for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, formulaProps);
          }
          const formulaV1Result = (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental);
          const valueV1 = this.doValueCorrection( formula.target, formulaV1Result, inputType);
          this.formulaDesignerService.upsertFormulaResult(formula.entityGuid, formula.fieldName, formula.target, valueV1, false);
          if (isOpenInDesigner) {
            console.log('Formula result:', valueV1);
          }
          return { value: valueV1, additionalValues: formulaProps.experimental.fieldAndValueWIP };
        default:
          if (isOpenInDesigner) {
            console.log(`Running formula for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, undefined);
          }
          const formulaDefaultResult = (formula.fn as FormulaFunctionDefault)();
          const valueDefault = this.doValueCorrection(formula.target, formulaDefaultResult, inputType);
          this.formulaDesignerService.upsertFormulaResult(formula.entityGuid, formula.fieldName, formula.target, valueDefault, false);
          if (isOpenInDesigner) {
            console.log('Formula result:', valueDefault);
          }
          return { value: valueV1 };
      }
    } catch (error) {
      const errorLabel = `Error in formula calculation for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}"`;
      this.formulaDesignerService.upsertFormulaResult(formula.entityGuid, formula.fieldName, formula.target, undefined, true);
      this.loggingService.addLog(LogSeverities.Error, errorLabel, error);
      if (isOpenInDesigner) {
        console.error(errorLabel, error);
      } else {
        this.loggingService.showMessage(this.translate.instant('Errors.FormulaCalculation'), 2000);
      }
    }
  }

  private doValueCorrection(target: FormulaTarget, value: FieldValue, inputType: InputType): FieldValue {
    // atm we are only correcting Value formulas
    if (target !== FormulaTargets.Value) { return value; }
    if (value == null) { return value; }

    if (inputType?.Type === InputTypeConstants.DatetimeDefault) {
      const date = new Date(value as string | number | Date);

      // if value is not ISO string, nor milliseconds, correct timezone
      if (!(typeof value === 'string' && value.endsWith('Z')) && date.getTime() !== value) {
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60000);
      }

      date.setMilliseconds(0);
      return date.toJSON();
    } else if (typeof (value) !== 'string' && (inputType?.Type?.startsWith(DataTypeConstants.String.toLocaleLowerCase())
      || inputType?.Type?.startsWith(DataTypeConstants.Hyperlink.toLocaleLowerCase()))) {
      return value.toString();
    }

    return value;
  }
}
