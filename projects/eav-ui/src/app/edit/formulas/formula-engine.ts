import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FieldSettings, FieldValue } from 'projects/edit-types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DataTypeConstants } from '../../content-type-fields/constants/data-type.constants';
import { InputTypeConstants } from '../../content-type-fields/constants/input-type.constants';
import { InputType } from '../../content-type-fields/models/input-type.model';
import { FeatureSummary } from '../../features/models';
import { FeaturesService } from '../../shared/services/features.service';
import { EntityReader } from '../shared/helpers';
import { ContentTypeSettings, FieldsProps, FormValues, LogSeverities } from '../shared/models';
import { EavContentType, EavContentTypeAttribute, EavEntity, EavEntityAttributes, EavHeader, EavValues } from '../shared/models/eav';
import { EavService, EditInitializerService, FieldsSettingsService, LoggingService } from '../shared/services';
import { GlobalConfigService, ItemService, LanguageInstanceService, LanguageService } from '../shared/store/ngrx-data';
import { FormulaDesignerService } from './formula-designer.service';
import { FormulaHelpers } from './formula.helpers';
// tslint:disable-next-line: max-line-length
import { FieldSettingPair, FieldValuePair, FormulaCacheItem, FormulaFieldValidation, FormulaFunctionDefault, FormulaFunctionV1, FormulaResultRaw, FormulaTarget, FormulaTargets, FormulaVersions, RunFormulasResult, SettingsFormulaPrefix } from './formula.models';
import { FormulaSettingsHelper } from './formula-settings.helper';
import { FieldLogicBase } from '../form/shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../form/shared/field-logic/field-logic-tools';
import { ConstantFieldParts } from './constant-field-parts';
import { consoleLogAngular } from '../../shared/helpers/console-log-angular.helper';

@Injectable()
export class FormulaEngine implements OnDestroy {
  private subscription: Subscription = new Subscription();
  private featuresCache$ = new BehaviorSubject<FeatureSummary[]>([]);
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
    private featuresService: FeaturesService,
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  init(
    fieldsSettingsService: FieldsSettingsService,
    contentTypeSettings$: BehaviorSubject<ContentTypeSettings>) {
    this.fieldsSettingsService = fieldsSettingsService;
    this.contentTypeSettings$ = contentTypeSettings$;
    this.subscription.add(this.featuresService.getAll$().subscribe(this.featuresCache$));
  }

  updateValuesFromQueue(
    entityGuid: string,
    queue: Record<string, { possibleValueUpdates: FormValues, possibleFieldsUpdates: FieldValuePair[], possibleSettingUpdate: FieldSettingPair[] }>,
    contentType: EavContentType,
    formValues: FormValues,
    fieldsProps: FieldsProps,
    slotIsEmpty: boolean,
    entityReader: EntityReader,
    latestFieldProps: FieldsProps,
    attributes: EavContentTypeAttribute[],
    contentTypeMetadata: EavEntity[],
    constantFieldParts: ConstantFieldParts[],
    itemAttributes: EavEntityAttributes,
    formReadOnly: boolean,
    logicTools: FieldLogicTools,
  ): { valuesUpdated: boolean, newFieldProps: FieldsProps } {
    if (queue[entityGuid] == null) return { valuesUpdated: false, newFieldProps: null };
    const toProcess = queue[entityGuid];
    queue[entityGuid] = { possibleValueUpdates: {}, possibleFieldsUpdates: [], possibleSettingUpdate: [] };
    // extract updates and flush queue
    const values = toProcess.possibleValueUpdates;
    const fields = toProcess.possibleFieldsUpdates;
    const allSettings = toProcess.possibleSettingUpdate;

    let valuesUpdated = false;
    if (Object.keys(values).length !== 0 || fields.length !== 0) {

      this.fieldsSettingsService.applyValueChangesFromFormulas(
        entityGuid, contentType, formValues, fieldsProps, values, fields, slotIsEmpty, entityReader
      );
      valuesUpdated = true;
    }

    let newFieldProps: FieldsProps = null;
    if (allSettings.length) {
      newFieldProps = { ...fieldsProps };
      allSettings.forEach(valueSet => { 
        const settingsNew: Record<string, any> = {};
        const settingsCurrent = latestFieldProps[valueSet.name]?.settings;
        const constantFieldPart = constantFieldParts.find(f => f.constants.fieldName === valueSet.name);
        valueSet.settings.forEach(setting => {
          FormulaSettingsHelper.keepSettingsIfTypeMatches(SettingsFormulaPrefix + setting.settingName, settingsCurrent, setting.value, settingsNew);
        });

        const updatedSettings = FormulaSettingsHelper.ensureNewSettingsMatchRequirements(
          constantFieldPart.settingsInitial,
          {
            ...settingsCurrent,
            ...settingsNew,
          },
          attributes.find(a => a.Name === valueSet.name),
          contentTypeMetadata,
          constantFieldPart.inputType,
          constantFieldPart.logic,
          itemAttributes[valueSet.name],
          entityReader,
          slotIsEmpty,
          formReadOnly,
          formValues[valueSet.name],
          logicTools,
        );

        newFieldProps[valueSet.name] = { ...newFieldProps[valueSet.name], settings: updatedSettings };
      });
    }

    return { valuesUpdated, newFieldProps };
  }

  runAllFormulas(
    entityGuid: string,
    entityId: number,
    attribute: EavContentTypeAttribute,
    formValues: FormValues,
    inputType: InputType,
    logic: FieldLogicBase,
    settingsInitial: FieldSettings,
    settingsCurrent: FieldSettings,
    itemHeader: EavHeader,
    contentTypeMetadata: EavEntity[],
    attributeValues: EavValues<any>,
    entityReader: EntityReader,
    slotIsEmpty: boolean,
    formReadOnly: boolean,
    valueBefore: FieldValue,
    logicTools: FieldLogicTools,
  ): RunFormulasResult {
    const formulas = this.formulaDesignerService.getFormulas(entityGuid, attribute.Name, null, false)
      .filter(f => !f.stopFormula);
    let formulaValue: FieldValue;
    let formulaValidation: FormulaFieldValidation;
    const formulaFields: FieldValuePair[] = [];
    const settingsNew: Record<string, any> = {};

    for (const formula of formulas) {
      const formulaResult = this.runFormula(formula, entityId, formValues, inputType, settingsInitial, settingsCurrent, itemHeader);
      if (formulaResult?.promise instanceof Promise) {
        this.handleFormulaPromises(entityGuid, formulaResult, formula, inputType);
        formula.stopFormula = formulaResult.stop ?? true;
      } else {
        formula.stopFormula = formulaResult.stop ?? formula.stopFormula;
      }

      if (formulaResult.fields)
        formulaFields.push(...formulaResult.fields);

      if (formulaResult.value === undefined) { continue; }

      if (formula.target === FormulaTargets.Value) {
        formulaValue = formulaResult.value;
        continue;
      }

      if (formula.target === FormulaTargets.Validation) {
        formulaValidation = formulaResult.value as unknown as FormulaFieldValidation;
        continue;
      }

      // { "Disab"}

      FormulaSettingsHelper.keepSettingsIfTypeMatches(formula.target, settingsCurrent, formulaResult.value, settingsNew);
    }

    const updatedSettings = FormulaSettingsHelper.ensureNewSettingsMatchRequirements(
      settingsInitial,
      {
        ...settingsCurrent,
        ...settingsNew,
      },
      attribute,
      contentTypeMetadata,
      inputType,
      logic,
      attributeValues,
      entityReader,
      slotIsEmpty,
      formReadOnly,
      valueBefore,
      logicTools,
    );

    const runFormulaResult: RunFormulasResult = {
      settings: updatedSettings,
      validation: formulaValidation,
      value: formulaValue,
      fields: formulaFields,
    };
    return runFormulaResult;
  }

  private handleFormulaPromises(
    entityGuid: string,
    formulaResult: FormulaResultRaw,
    formula: FormulaCacheItem,
    inputType: InputType,
  ) {
    consoleLogAngular("formula promise", formula.target, formulaResult);
    if (formulaResult.openInDesigner && formulaResult.stop === null) {
      console.log(`FYI: formula returned a promise. This automatically stops this formula from running again. If you want it to continue running, return stop: false`);
    }
    formula.promises$.next(formulaResult.promise);
    if (!formula.updateCallback$.value) {
      const queue = this.fieldsSettingsService.updateValueQueue;
      formula.updateCallback$.next((result: FieldValue | FormulaResultRaw) => {
        queue[entityGuid] = queue[entityGuid] ?? { possibleValueUpdates: {}, possibleFieldsUpdates: [], possibleSettingUpdate: [] };
        let possibleValueUpdates: FormValues = {};
        let possibleSettingUpdate: FieldSettingPair[] = [];
        const corrected = this.correctAllValues(formula.target, result, inputType);

        if (formula.target === FormulaTargets.Value) {
          possibleValueUpdates = queue[entityGuid].possibleValueUpdates ?? {};
          possibleValueUpdates[formula.fieldName] = corrected.value;

        } else if (formula.target.startsWith(SettingsFormulaPrefix)) {
          consoleLogAngular("formula promise settings");
          const settingName = formula.target.substring(SettingsFormulaPrefix.length);
          possibleSettingUpdate = queue[entityGuid].possibleSettingUpdate ?? [];
          const newSetting = { name: formula.fieldName, settings: [{ settingName, value: result as FieldValue }] };
          possibleSettingUpdate = possibleSettingUpdate.filter(s => s.name !== formula.fieldName && !s.settings.find(ss => ss.settingName === settingName));
          possibleSettingUpdate.push(newSetting);
        }

        const possibleFieldsUpdates = queue[entityGuid].possibleFieldsUpdates ?? [];
        if (corrected.fields)
          possibleFieldsUpdates.push(...corrected.fields);
        queue[entityGuid] = { possibleValueUpdates, possibleFieldsUpdates, possibleSettingUpdate };
        formula.stopFormula = corrected.stop ?? formula.stopFormula;
        this.fieldsSettingsService.retriggerFormulas();
      });
    }
  }

  private getFormulaSettingsKey(fieldName: string, currentLanguage: string, defaultLanguage: string): string {
    return `fieldName:${fieldName}:currentLanguage:${currentLanguage}:defaultLanguage:${defaultLanguage}`;
  }

  private runFormula(
    formula: FormulaCacheItem,
    entityId: number,
    formValues: FormValues,
    inputType: InputType,
    settingsInitial: FieldSettings,
    settingsCurrent: FieldSettings,
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
      settingsInitial,
      settingsCurrent,
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
          if (isOpenInDesigner) {
            console.log(`Running formula${formula.version.toLocaleUpperCase()} for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, formulaProps);
          }
          const formulaV1Result = (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental);
          const isArray = formulaV1Result && Array.isArray(formulaV1Result) && (formulaV1Result as any).every((r: any) => typeof r === 'string');
          if (typeof formulaV1Result === 'string'
            || typeof formulaV1Result === 'number'
            || typeof formulaV1Result === 'boolean'
            || isArray
            || !formulaV1Result) {
            if (formula.target === FormulaTargets.Value) {
              const valueV1 = {
                value: this.valueCorrection(formulaV1Result as FieldValue, inputType),
                fields: [], stop: null, openInDesigner: isOpenInDesigner
              } as FormulaResultRaw;
              this.formulaDesignerService.sendFormulaResultToUi(
                formula.entityGuid, formula.fieldName, formula.target, valueV1.value, false, false);
              if (isOpenInDesigner) {
                console.log('Formula result:', valueV1);
              }
              return valueV1;
            }
            return {
              value: formulaV1Result, fields: [],
              stop: null, openInDesigner: isOpenInDesigner
            } as FormulaResultRaw;
          }
          console.error('V1 formulas accept only simple values in return statements. If you need to return an complex object, use V2 formulas.');
          return { value: undefined, fields: [], stop: null, openInDesigner: isOpenInDesigner } as FormulaResultRaw;
        case FormulaVersions.V2:
          if (isOpenInDesigner) {
            console.log(`Running formula${formula.version.toLocaleUpperCase()} for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, formulaProps);
          }
          const formulaV2Result = (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental);
          const valueV2 = this.correctAllValues(formula.target, formulaV2Result, inputType);
          valueV2.openInDesigner = isOpenInDesigner;
          if (valueV2.value === undefined && valueV2.promise)
            this.formulaDesignerService.sendFormulaResultToUi(
              formula.entityGuid, formula.fieldName, formula.target, undefined, false, true);
          else
            this.formulaDesignerService.sendFormulaResultToUi(
              formula.entityGuid, formula.fieldName, formula.target, valueV2.value, false, false);
          if (isOpenInDesigner) {
            console.log('Formula result:', valueV2.value);
          }
          return valueV2;
        default:
          if (isOpenInDesigner) {
            console.log(`Running formula for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, undefined);
          }
          const formulaDefaultResult = (formula.fn as FormulaFunctionDefault)();
          const valueDefault = this.correctAllValues(formula.target, formulaDefaultResult, inputType);
          valueDefault.openInDesigner = isOpenInDesigner;
          this.formulaDesignerService.sendFormulaResultToUi(
            formula.entityGuid, formula.fieldName, formula.target, valueDefault.value, false, false);
          if (isOpenInDesigner) {
            console.log('Formula result:', valueDefault);
          }
          return valueDefault;
      }
    } catch (error) {
      const errorLabel = `Error in formula calculation for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}"`;
      this.formulaDesignerService.sendFormulaResultToUi(formula.entityGuid, formula.fieldName, formula.target, undefined, true, false);
      this.loggingService.addLog(LogSeverities.Error, errorLabel, error);
      if (isOpenInDesigner) {
        console.error(errorLabel, error);
      } else {
        this.loggingService.showMessage(this.translate.instant('Errors.FormulaCalculation'), 2000);
      }
      return { value: undefined, fields: [], stop: null, openInDesigner: isOpenInDesigner } as FormulaResultRaw;
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
    const stop = (result as FormulaResultRaw)?.stop ?? null;
    if (result === null || result === undefined)
      return { value: result as FieldValue, fields: [], stop };
    if (typeof result === 'object') {
      if (result instanceof Date && target === FormulaTargets.Value)
        return { value: this.valueCorrection(result as FieldValue, inputType), fields: [], stop };
      if (result instanceof Promise)
        return { value: undefined, promise: result as Promise<FormulaResultRaw>, fields: [], stop };
      const corrected: FormulaResultRaw = (result as FormulaResultRaw);
      corrected.stop = stop;
      if ((result as FormulaResultRaw).value && target === FormulaTargets.Value) {
        corrected.value = this.valueCorrection((result as FormulaResultRaw).value, inputType);
      }
      if ((result as FormulaResultRaw).fields) {
        corrected.fields = (result as FormulaResultRaw).fields?.map((fields) => {
          fields.value = this.valueCorrection(fields.value, inputType);
          return fields;
        });
        return corrected;
      }
      return corrected;
    }
    const value: FormulaResultRaw = { value: result as FieldValue };

    // atm we are only correcting Value formulas
    if (target === FormulaTargets.Value) {
      return { value: this.valueCorrection(value.value, inputType), fields: [], stop };
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
