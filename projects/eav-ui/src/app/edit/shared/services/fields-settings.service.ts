import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, Subscription } from 'rxjs';
import { EavService, EditInitializerService, LoggingService } from '.';
import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { DataTypeConstants } from '../../../content-type-fields/constants/data-type.constants';
import { InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { FeatureSummary } from '../../../features/models';
import { consoleLogAngular } from '../../../shared/helpers/console-log-angular.helper';
import { FeaturesService } from '../../../shared/services/features.service';
import { FieldLogicManager } from '../../form/shared/field-logic/field-logic-manager';
// tslint:disable-next-line:max-line-length
import { EntityReader, FieldsSettingsHelpers, FormulaHelpers, GeneralHelpers, InputFieldHelpers, LocalizationHelpers, ValidationHelpers } from '../helpers';
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
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);

    this.subscription.add(this.featuresService.getAll$().subscribe(this.featuresCache$));

    const entityReader$ = combineLatest([currentLanguage$, defaultLanguage$]).pipe(map(([currentLanguage, defaultLanguage]) => {
      return new EntityReader(currentLanguage, defaultLanguage);
    }), distinctUntilChanged());

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
    this.subscription.add(
      combineLatest([
        combineLatest([contentType$, currentLanguage$, defaultLanguage$, itemAttributes$, itemHeader$, inputTypes$]),
        combineLatest([entityReader$, readOnly$, this.forceRefreshSettings$, debugEnabled$]),
      ]).pipe(
        map(([
          [contentType, currentLanguage, defaultLanguage, itemAttributes, itemHeader, inputTypes],
          [entityReader, readOnly, _, debugEnabled],
        ]) => {
          const formValues: FormValues = {};
          for (const [fieldName, fieldValues] of Object.entries(itemAttributes)) {
            formValues[fieldName] = entityReader.getBestValue(fieldValues, null);
          }

          const fieldsProps: FieldsProps = {};
          const formulaUpdates: FormValues = {};
          for (const attribute of contentType.Attributes) {
            const attributeValues = itemAttributes[attribute.Name];
            // empty-default and empty-message have no value
            const value = formValues[attribute.Name];
            // custom-default has no inputType
            const inputType = inputTypes.find(i => i.Type === attribute.InputType);

            const mergeRaw = entityReader.flattenAll<FieldSettings>(attribute.Metadata);
            // Sometimes the metadata doesn't have the input type (empty string), so we'll add the attribute.InputType just in case...
            mergeRaw.InputType = attribute.InputType;
            const merged = FieldsSettingsHelpers.setDefaultFieldSettings(mergeRaw);
            consoleLogAngular('merged', JSON.parse(JSON.stringify(merged)));

            // run formulas
            const formulaResult = this.runFormulas(entityGuid, entityId, attribute.Name, formValues, inputType, merged, itemHeader);
            const calculated = formulaResult.settings;
            const formulaValue = formulaResult.value;
            const formulaValidation = formulaResult.validation;

            // special fixes
            calculated.Name = calculated.Name || attribute.Name;
            calculated.Required = ValidationHelpers.isRequired(calculated);
            calculated.DisableTranslation = FieldsSettingsHelpers.findDisableTranslation(
              contentType.Metadata, inputType, attributeValues, defaultLanguage, attribute.Metadata,
            );
            const slotIsEmpty = itemHeader.IsEmptyAllowed && itemHeader.IsEmpty;
            calculated.DisableTranslation = slotIsEmpty || calculated.DisableTranslation;
            calculated.Disabled = slotIsEmpty || calculated.Disabled;
            const disabledBecauseTranslations = FieldsSettingsHelpers.getDisabledBecauseTranslations(
              attributeValues, calculated.DisableTranslation, currentLanguage, defaultLanguage,
            );
            calculated.Disabled = disabledBecauseTranslations || calculated.Disabled;
            calculated.Disabled = readOnly.isReadOnly || calculated.Disabled;
            calculated.DisableAutoTranslation = calculated.DisableAutoTranslation || calculated.DisableTranslation;

            // update settings with respective FieldLogics
            const logic = FieldLogicManager.singleton().get(attribute.InputType);
            const fixed = logic?.update(calculated, value, this.eavService.eavConfig, debugEnabled) ?? calculated;
            consoleLogAngular('calculated', JSON.parse(JSON.stringify(calculated)));

            // important to compare with undefined because null is allowed value
            if (!slotIsEmpty && !disabledBecauseTranslations && value !== undefined && formulaValue !== undefined) {
              let valuesNotEqual = value !== formulaValue;
              // do a more in depth comparison in case of calculated entity fields
              if (valuesNotEqual && Array.isArray(value) && Array.isArray(formulaValue)) {
                valuesNotEqual = !GeneralHelpers.arraysEqual(value as string[], formulaValue as string[]);
              }
              if (valuesNotEqual) {
                formulaUpdates[attribute.Name] = formulaValue;
              }
            }

            const calculatedInputType = InputFieldHelpers.calculateInputType(attribute, inputTypes);
            const wrappers = InputFieldHelpers.getWrappers(fixed, calculatedInputType);
            const initialSettings = FieldsSettingsHelpers.setDefaultFieldSettings(
              // TODO: unclear why we're not using the current language but the default
              new EntityReader(this.eavService.eavConfig.lang, defaultLanguage).flattenAll<FieldSettings>(attribute.Metadata)
              // FieldsSettingsHelpers.mergeSettings<FieldSettings>(attribute.Metadata, this.eavService.eavConfig.lang, defaultLanguage),
            );
            const initialDisabled = initialSettings.Disabled ?? false;
            const fieldTranslation = FieldsSettingsHelpers.getTranslationState(
              attributeValues, fixed.DisableTranslation, currentLanguage, defaultLanguage,
            );
            const index = contentType.Attributes.indexOf(attribute);

            fieldsProps[attribute.Name] = {
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
              },
              settings: fixed,
              translationState: fieldTranslation,
              value,
              wrappers,
              formulaValidation,
            };
          }

          if (Object.keys(formulaUpdates).length > 0 && this.maxValueFormulaCycles > this.valueFormulaCounter) {
            this.valueFormulaCounter++;
            this.itemService.updateItemAttributesValues(entityGuid, formulaUpdates, currentLanguage, defaultLanguage);
            return;
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
    const formulaSettings: Record<string, any> = {};
    for (const formula of formulas) {
      const runResult = this.runFormula(formula, entityId, formValues, inputType, settings, previousSettings, itemHeader);
      if (runResult === undefined) { continue; }

      if (formula.target === FormulaTargets.Value) {
        formulaValue = runResult;
        continue;
      }

      if (formula.target === FormulaTargets.Validation) {
        formulaValidation = runResult as unknown as FormulaFieldValidation;
        continue;
      }

      if (formula.target.startsWith(SettingsFormulaPrefix)) {
        const settingName = formula.target.substring(SettingsFormulaPrefix.length);
        const defaultSetting = (settings as Record<string, any>)[settingName];

        if (defaultSetting == null || runResult == null) {
          // can't check types, hope for the best
          formulaSettings[settingName] = runResult;
          continue;
        }

        if (Array.isArray(defaultSetting) && Array.isArray(runResult)) {
          // can't check types of items in array, hope for the best
          formulaSettings[settingName] = runResult;
          continue;
        }

        if (typeof defaultSetting === typeof runResult) {
          // maybe typesafe
          formulaSettings[settingName] = runResult;
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
  ): FieldValue {
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
          const valueV1 = this.doValueCorrection(
            formula.target,
            (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental),
            inputType,
          );
          this.formulaDesignerService.upsertFormulaResult(formula.entityGuid, formula.fieldName, formula.target, valueV1, false);
          if (isOpenInDesigner) {
            console.log('Formula result:', valueV1);
          }
          return valueV1;
        default:
          if (isOpenInDesigner) {
            console.log(`Running formula for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, undefined);
          }
          const valueDefault = this.doValueCorrection(
            formula.target,
            (formula.fn as FormulaFunctionDefault)(),
            inputType,
          );
          this.formulaDesignerService.upsertFormulaResult(formula.entityGuid, formula.fieldName, formula.target, valueDefault, false);
          if (isOpenInDesigner) {
            console.log('Formula result:', valueDefault);
          }
          return valueDefault;
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
