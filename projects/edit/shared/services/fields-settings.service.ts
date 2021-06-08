import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { EavService, EditInitializerService, LoggingService } from '.';
import { FieldSettings, FieldValue } from '../../../edit-types';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { FormValues } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { FieldLogicManager } from '../../field-logic/field-logic-manager';
import { FieldsSettingsHelpers, FormulaHelpers, GeneralHelpers, InputFieldHelpers, LocalizationHelpers, ValidationHelpers } from '../helpers';
// tslint:disable-next-line:max-line-length
import { ContentTypeSettings, FieldsProps, FormulaCacheItem, FormulaFunctionDefault, FormulaFunctionV1, FormulaTargets, FormulaVersions, LogSeverities, RunFormulasResult, SettingsFormulaPrefix, TranslationState } from '../models';
import { EavHeader } from '../models/eav';
import { ContentTypeService, GlobalConfigService, InputTypeService, ItemService, LanguageInstanceService, LanguageService } from '../store/ngrx-data';
import { FormulaDesignerService } from './formula-designer.service';

@Injectable()
export class FieldsSettingsService implements OnDestroy {
  private contentTypeSettings$: BehaviorSubject<ContentTypeSettings>;
  private fieldsProps$: BehaviorSubject<FieldsProps>;
  private forceSettings$: BehaviorSubject<void>;
  private subscription: Subscription;
  private valueFormulaCounter = 0;
  private maxValueFormulaCycles = 5;
  private formulaSettingsCache: Record<string, FieldSettings> = {};

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
  ) { }

  ngOnDestroy(): void {
    this.contentTypeSettings$?.complete();
    this.fieldsProps$?.complete();
    this.forceSettings$?.complete();
    this.subscription?.unsubscribe();
  }

  init(entityGuid: string): void {
    this.subscription = new Subscription();
    this.contentTypeSettings$ = new BehaviorSubject(null);
    this.fieldsProps$ = new BehaviorSubject(null);
    this.forceSettings$ = new BehaviorSubject(null);

    const item = this.itemService.getItem(entityGuid);
    const entityId = item.Entity.Id;
    const contentTypeId = InputFieldHelpers.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentType$(contentTypeId);
    const itemHeader$ = this.itemService.getItemHeader$(entityGuid);
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);

    this.subscription.add(
      combineLatest([contentType$, itemHeader$, currentLanguage$, defaultLanguage$]).pipe(
        map(([contentType, itemHeader, currentLanguage, defaultLanguage]) => {
          const ctSettings = FieldsSettingsHelpers.setDefaultContentTypeSettings(
            FieldsSettingsHelpers.mergeSettings<ContentTypeSettings>(contentType.Metadata, currentLanguage, defaultLanguage),
            contentType,
            currentLanguage,
            defaultLanguage,
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
    this.subscription.add(
      combineLatest([
        combineLatest([contentType$, currentLanguage$, defaultLanguage$, itemAttributes$, itemHeader$, inputTypes$]),
        combineLatest([this.forceSettings$]),
      ]).pipe(
        map(([
          [contentType, currentLanguage, defaultLanguage, itemAttributes, itemHeader, inputTypes],
          [forceSettings],
        ]) => {
          const formValues: FormValues = {};
          for (const [fieldName, fieldValues] of Object.entries(itemAttributes)) {
            formValues[fieldName] = LocalizationHelpers.translate(currentLanguage, defaultLanguage, fieldValues, null);
          }

          const fieldsProps: FieldsProps = {};
          const formulaUpdates: FormValues = {};
          for (const attribute of contentType.Attributes) {
            const attributeValues = itemAttributes[attribute.Name];
            // empty-default has no value
            const value = formValues[attribute.Name];
            // custom-default has no inputType
            const inputType = inputTypes.find(i => i.Type === attribute.InputType);

            const merged = FieldsSettingsHelpers.setDefaultFieldSettings(
              FieldsSettingsHelpers.mergeSettings<FieldSettings>(attribute.Metadata, defaultLanguage, defaultLanguage),
            );

            // run formulas
            const formulaResult = this.runFormulas(entityGuid, entityId, attribute.Name, formValues, inputType, merged, itemHeader);
            const calculated = formulaResult.settings;
            const formulaValue = formulaResult.value;

            // special fixes
            calculated.Name = calculated.Name || attribute.Name;
            calculated.Required = ValidationHelpers.isRequired(calculated);
            calculated.DisableTranslation = FieldsSettingsHelpers.findDisableTranslation(
              inputType, attributeValues, defaultLanguage, attribute.Metadata,
            );
            const slotIsEmpty = itemHeader.Group?.SlotCanBeEmpty && itemHeader.Group?.SlotIsEmpty;
            calculated.DisableTranslation = slotIsEmpty || calculated.DisableTranslation;
            calculated.Disabled = slotIsEmpty || calculated.Disabled;
            const disabledBecauseTranslations = FieldsSettingsHelpers.getDisabledBecauseTranslations(
              attributeValues, calculated.DisableTranslation, currentLanguage, defaultLanguage,
            );
            calculated.Disabled = disabledBecauseTranslations || calculated.Disabled;
            // update settings with respective FieldLogics
            const logic = FieldLogicManager.singleton().get(attribute.InputType);
            const fixed = logic?.update(calculated, value) ?? calculated;

            // important to compare with undefined because null is allowed value
            if (!slotIsEmpty && !disabledBecauseTranslations && value !== undefined && formulaValue !== undefined) {
              let valuesNotEqual = value !== formulaValue;
              // do a more in depth comparisson in case of calculated entity fields
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
              FieldsSettingsHelpers.mergeSettings<FieldSettings>(attribute.Metadata, this.eavService.eavConfig.lang, defaultLanguage),
            );
            const initialDisabled = initialSettings.Disabled ?? false;
            const fieldTranslation = FieldsSettingsHelpers.getTranslationState(
              attributeValues, fixed.DisableTranslation, currentLanguage, defaultLanguage,
            );

            fieldsProps[attribute.Name] = {
              calculatedInputType,
              constants: {
                angularAssets: inputType?.AngularAssets,
                contentTypeId,
                entityGuid,
                fieldName: attribute.Name,
                index: contentType.Attributes.indexOf(attribute),
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
    this.forceSettings$.next();
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
    const formulaSettings: Record<string, any> = {};
    for (const formula of formulas) {
      const runResult = this.runFormula(formula, entityId, formValues, inputType, settings, previousSettings, itemHeader);
      if (runResult === undefined) { continue; }

      if (formula.target === FormulaTargets.Value) {
        formulaValue = runResult;
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
          if (isOpenInDesigner) {
            console.log(`Running formula${FormulaVersions.V1.toLocaleUpperCase()} for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, formulaProps);
          }
          const valueV1 = this.doValueCorrection(
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

  private doValueCorrection(value: FieldValue, inputType: InputType): FieldValue {
    if (value == null) { return value; }

    if (inputType.Type === InputTypeConstants.DatetimeDefault) {
      const date = new Date(value as string | number | Date);

      // if value is ISO string, or miliseconds, no correction
      if (date.toJSON() === value || date.getTime() === value) {
        return date.toJSON();
      }

      // otherwise do timezone correction
      date.setTime(date.getTime() - date.getTimezoneOffset() * 60000);
      return date.toJSON();
    }

    return value;
  }
}
