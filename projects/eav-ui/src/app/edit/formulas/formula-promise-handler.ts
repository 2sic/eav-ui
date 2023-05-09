import { FieldValue } from "projects/edit-types";
import { InputType } from "../../content-type-fields/models/input-type.model";
import { consoleLogAngular } from "../../shared/helpers/console-log-angular.helper";
import { FieldLogicTools } from "../form/shared/field-logic/field-logic-tools";
import { EntityReader } from "../shared/helpers";
import { FormValues, FieldsProps } from "../shared/models";
import { EavContentType, EavContentTypeAttribute, EavEntity, EavEntityAttributes } from "../shared/models/eav";
import { ConstantFieldParts } from "./models/constant-field-parts.model";
import { FormulaPromiseResult } from "./models/formula-promise-result.model";
import { FormulaSettingsHelper } from "./helpers/formula-settings.helper";
import { FormulaValueCorrections } from "./helpers/formula-value-corrections.helper";
import { FormulaCacheItem, FormulaTargets, SettingsFormulaPrefix } from "./models/formula.models";
import { Injectable } from "@angular/core";
import { FieldsSettingsService } from "../shared/services";
import { FormulaResultRaw, FieldSettingPair } from "./models/formula-results.models";

// TODO: @SDV - ADD short TSDoc for the class and the methods
@Injectable()
export class FormulaPromiseHandler {
  private fieldsSettingsService: FieldsSettingsService = null;

  constructor() { }

  init(fieldsSettingsService: FieldsSettingsService) {
    this.fieldsSettingsService = fieldsSettingsService;
  }

  handleFormulaPromises(
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
        queue[entityGuid] = queue[entityGuid] ?? new FormulaPromiseResult({}, [], []);
        let valueUpdates: FormValues = {};
        let settingUpdate: FieldSettingPair[] = [];
        const corrected = FormulaValueCorrections.correctAllValues(formula.target, result, inputType);

        if (formula.target === FormulaTargets.Value) {
          valueUpdates = queue[entityGuid].valueUpdates ?? {};
          valueUpdates[formula.fieldName] = corrected.value;

        } else if (formula.target.startsWith(SettingsFormulaPrefix)) {
          consoleLogAngular("formula promise settings");
          const settingName = formula.target.substring(SettingsFormulaPrefix.length);
          settingUpdate = queue[entityGuid].settingUpdates ?? [];
          const newSetting = { name: formula.fieldName, settings: [{ settingName, value: result as FieldValue }] };
          settingUpdate = settingUpdate.filter(s => s.name !== formula.fieldName && !s.settings.find(ss => ss.settingName === settingName));
          settingUpdate.push(newSetting);
        }

        const fieldsUpdates = queue[entityGuid].fieldUpdates ?? [];
        if (corrected.fields)
          fieldsUpdates.push(...corrected.fields);
        queue[entityGuid] = new FormulaPromiseResult(valueUpdates, fieldsUpdates, settingUpdate);
        formula.stopFormula = corrected.stop ?? formula.stopFormula;
        this.fieldsSettingsService.retriggerFormulas();
      });
    }
  }

  updateValuesFromQueue(
    entityGuid: string,
    queue: Record<string, FormulaPromiseResult>,
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
    queue[entityGuid] = { valueUpdates: {}, fieldUpdates: [], settingUpdates: [] };
    // extract updates and flush queue
    const values = toProcess.valueUpdates;
    const fields = toProcess.fieldUpdates;
    const allSettings = toProcess.settingUpdates;

    let valuesUpdated = false;
    if (Object.keys(values).length !== 0 || fields.length !== 0) {
      // TODO: @STV THIS is a deep dependency = bad dependency
      // please give the formFormulaService into this call, so you don't access it through the fieldSettingsService
      // on the fieldSettingsService it must be private - this is a bad dependency
      this.fieldsSettingsService.formFormulaService.applyValueChangesFromFormulas(
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
}