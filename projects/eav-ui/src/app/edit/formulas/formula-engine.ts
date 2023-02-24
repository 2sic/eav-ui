import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FieldSettings, FieldValue, FieldValuePair, FormulaResultRaw } from 'projects/edit-types';
import { BehaviorSubject } from 'rxjs';
import { DataTypeConstants } from '../../content-type-fields/constants/data-type.constants';
import { InputTypeConstants } from '../../content-type-fields/constants/input-type.constants';
import { InputType } from '../../content-type-fields/models/input-type.model';
import { FeatureSummary } from '../../features/models';
import { FormulaHelpers } from '../shared/helpers';
// tslint:disable-next-line: max-line-length
import { ContentTypeSettings, FormulaCacheItem, FormulaFieldValidation, FormulaFunctionDefault, FormulaFunctionV1, FormulaTarget, FormulaTargets, FormulaVersions, FormValues, LogSeverities, RunFormulasResult, SettingsFormulaPrefix } from '../shared/models';
import { EavHeader } from '../shared/models/eav';
import { EavService, EditInitializerService, FieldsSettingsService, FormulaDesignerService, LoggingService } from '../shared/services';
import { GlobalConfigService, ItemService, LanguageInstanceService, LanguageService } from '../shared/store/ngrx-data';

@Injectable()
export class FormulaEngine {
  private formulaSettingsCache: Record<string, FieldSettings> = {};
  private featuresCache$: BehaviorSubject<FeatureSummary[]>;
  private contentTypeSettings$: BehaviorSubject<ContentTypeSettings>;
  private fieldsSettingsService: FieldsSettingsService = null;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private itemService: ItemService,
    private languageService: LanguageService,
    private formulaDesignerService: FormulaDesignerService,
    private loggingService: LoggingService,
    private translate: TranslateService,
    private globalConfigService: GlobalConfigService,
    private editInitializerService: EditInitializerService,
  ) { }

  init(
    fieldsSettingsService: FieldsSettingsService,
    featuresCache$: BehaviorSubject<FeatureSummary[]>,
    contentTypeSettings$: BehaviorSubject<ContentTypeSettings>) {
    this.fieldsSettingsService = fieldsSettingsService;
    this.featuresCache$ = featuresCache$;
    this.contentTypeSettings$ = contentTypeSettings$;
  }

  runFormulas(
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

    const formulas = this.formulaDesignerService.getFormulas(entityGuid, fieldName, null, false)
      .filter(f => !f.stopFormula);
    let formulaValue: FieldValue;
    let formulaValidation: FormulaFieldValidation;
    const formulaResultAdditionalValues: FieldValuePair[] = [];
    const formulaSettings: Record<string, any> = {};
    for (const formula of formulas) {
      const formulaResult = this.runFormula(formula, entityId, formValues, inputType, settings, previousSettings, itemHeader);
      if (formulaResult.promise && formulaResult.promise instanceof Promise) {
        if (formulaResult.openInDesigner) {
          // SDV TODO - only if stop is not set
          // 2DM TODO - improve this message
          console.log(`This promise will loop formulas only once, if you want it to continue looping return stopFormula: false`);
        }
        formula.promises$.next(formulaResult.promise);
        if (!formula.updateCallback$.value) {
          // SDV todo - move queue from parent to here
          const queue = this.fieldsSettingsService.updateValueQueue;
          formula.updateCallback$.next((result: FieldValue | FormulaResultRaw) => {
            queue[entityGuid] = { possibleValueUpdates: null, possibleAditionalValueUpdates: null };
            const correctedValue = this.correctAllValues(formula.target, result, inputType);
            if (!queue[entityGuid])
              queue[entityGuid] = { possibleValueUpdates: {}, possibleAditionalValueUpdates: [] };
            const possibleValueUpdates = queue[entityGuid].possibleValueUpdates ?? {};
            possibleValueUpdates[formula.fieldName] = correctedValue.value;
            const possibleAditionalValueUpdates = queue[entityGuid].possibleAditionalValueUpdates ?? [];
            if (correctedValue.additionalValues)
              possibleAditionalValueUpdates.push(...correctedValue.additionalValues);
            queue[entityGuid] = { possibleValueUpdates, possibleAditionalValueUpdates };
            this.fieldsSettingsService.forceSettings();
          });
        }
        formula.stopFormula = formulaResult.stopFormula ?? true;
      } else {
        formula.stopFormula = formulaResult.stopFormula ?? false;
      }

      if (formulaResult.additionalValues)
        formulaResultAdditionalValues.push(...formulaResult.additionalValues);

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

    const runFormulaResult: RunFormulasResult = {
      settings: {
        ...settings,
        ...formulaSettings,
      },
      validation: formulaValidation,
      value: formulaValue,
      additionalValues: formulaResultAdditionalValues,
    };
    return runFormulaResult;
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
      this.fieldsSettingsService,
      this.featuresCache$.value,
    );
    const isOpenInDesigner = this.isDesignerOpen(formula);
    const ctSettings = this.contentTypeSettings$.value;
    try {
      switch (formula.version) {
        case FormulaVersions.V1:
        case FormulaVersions.V2:
          if (isOpenInDesigner) {
            console.log(`Running formula${formula.version.toLocaleUpperCase()} for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, formulaProps);
          }
          const formulaV1Result = (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental);
          const valueV1 = this.correctAllValues(formula.target, formulaV1Result, inputType);
          valueV1.openInDesigner = isOpenInDesigner;
          this.formulaDesignerService.sendFormulaResultToUi(formula.entityGuid, formula.fieldName, formula.target, valueV1.value, false);
          if (isOpenInDesigner) {
            console.log('Formula result:', valueV1.value);
          }
          return valueV1;
        default:
          if (isOpenInDesigner) {
            console.log(`Running formula for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, undefined);
          }
          const formulaDefaultResult = (formula.fn as FormulaFunctionDefault)();
          const valueDefault = this.correctAllValues(formula.target, formulaDefaultResult, inputType);
          valueDefault.openInDesigner = isOpenInDesigner;
          this.formulaDesignerService.sendFormulaResultToUi(
            formula.entityGuid, formula.fieldName, formula.target, valueDefault.value, false);
          if (isOpenInDesigner) {
            console.log('Formula result:', valueDefault);
          }
          return valueDefault;
      }
    } catch (error) {
      const errorLabel = `Error in formula calculation for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}"`;
      this.formulaDesignerService.sendFormulaResultToUi(formula.entityGuid, formula.fieldName, formula.target, undefined, true);
      this.loggingService.addLog(LogSeverities.Error, errorLabel, error);
      if (isOpenInDesigner) {
        console.error(errorLabel, error);
      } else {
        this.loggingService.showMessage(this.translate.instant('Errors.FormulaCalculation'), 2000);
      }
    }
  }

  private isDesignerOpen(formula: FormulaCacheItem): boolean {
    const designerState = this.formulaDesignerService.getDesignerState();
    const isOpenInDesigner = designerState.isOpen
      && designerState.entityGuid === formula.entityGuid
      && designerState.fieldName === formula.fieldName
      && designerState.target === formula.target;
    return isOpenInDesigner;
  }

  private correctAllValues(target: FormulaTarget, result: FieldValue | FormulaResultRaw, inputType: InputType): FormulaResultRaw {
    const stop = (result as FormulaResultRaw)?.stopFormula ?? null;
    if (result === null || result === undefined)
      return { value: result as FieldValue, additionalValues: [], stopFormula: stop };
    if (typeof result === 'object') {
      if (result instanceof Date && target === FormulaTargets.Value)
        return { value: this.valueCorrection(result as FieldValue, inputType), additionalValues: [], stopFormula: stop };
      if (result instanceof Promise)
        return { value: undefined, promise: result as Promise<FormulaResultRaw>, additionalValues: [], stopFormula: stop };
      const corrected: FormulaResultRaw = (result as FormulaResultRaw);
      corrected.stopFormula = stop;
      if ((result as FormulaResultRaw).value && target === FormulaTargets.Value) {
        corrected.value = this.valueCorrection((result as FormulaResultRaw).value, inputType);
      }
      if ((result as FormulaResultRaw).additionalValues) {
        corrected.additionalValues = (result as FormulaResultRaw).additionalValues?.map((additionalValue) => {
          additionalValue.value = this.valueCorrection(additionalValue.value, inputType);
          return additionalValue;
        });
        return corrected;
      }
      return corrected;
    }
    const value: FormulaResultRaw = { value: result as FieldValue };

    // atm we are only correcting Value formulas
    if (target === FormulaTargets.Value) {
      return { value: this.valueCorrection(value.value, inputType), additionalValues: [], stopFormula: stop };
    }
    return value;
  }

  private valueCorrection(value: FieldValue, inputType: InputType): FieldValue {
    if (value == null) {
      return value;
    } else if (inputType?.Type === InputTypeConstants.DatetimeDefault) {
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
