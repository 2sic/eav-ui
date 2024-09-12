import { untracked } from '@angular/core';
import { FormulaDesignerService } from './designer/formula-designer.service';
import { FormulaRunOneHelpersFactory } from './formula-run-one-helpers.factory';
import { FormulaFunctionV1, FormulaVersions } from './formula-definitions';
import { FormulaFieldValidation } from './targets/formula-targets';
import { FormulaCacheItem } from './cache/formula-cache.model';
import { FormulaSettingsHelper } from './results/formula-settings.helper';
import { FormulaPromiseHandler } from './promise/formula-promise-handler';
import { RunFormulasResult, FormulaResultRaw, FieldValuePair } from './results/formula-results.models';
import { ItemIdentifierShared } from '../../shared/models/edit-form.model';
import { FormulaExecutionSpecsWithRunParams, FormulaExecutionSpecs, FormulaRunParameters, FormulaRunPickers } from './run/formula-objects-internal-data';
import { FieldSettingsUpdateHelper } from '../state/fields-settings-update.helpers';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { FieldConstantsOfLanguage, FieldProps } from '../state/fields-configs.model';
import { classLog } from '../../shared/logging';
import { PickerItem } from '../fields/picker/models/picker-item.model';
import { getVersion } from '../../shared/signals/signal.utilities';
import groupBy from 'lodash-es/groupBy';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { logSpecsFormulaFields } from './formula-engine';
import { DebugFields } from '../edit-debug';

const logSpecs = {
  all: true,
  runFormula: true,
  runOrInitSettings: true,
  getPickerInfos: true,
  fields: [...DebugFields, '*'], // will be replaced by shared list below
};

/**
 * Run all formulas of a single field.
 * Will also ensure that any settings are initialized properly if not yet created.
 */
export class FormulaRunField {

  log = classLog({FormulaRunField}, { ...logSpecs, fields: logSpecsFormulaFields });

  constructor(
    private promiseHandler: FormulaPromiseHandler,
    private designerSvc: FormulaDesignerService,
    private entityGuid: string,
    private runOneHelper: FormulaRunOneHelpersFactory,
  ) { }

  /**
   * Used for running all formulas for a given attribute/field.
   * @returns Object with all changes that formulas should make
   */
  runOrInitSettings(
    currentValues: ItemValuesOfLanguage,
    fieldName: string,
    fieldConstants: FieldConstantsOfLanguage,
    settingsBefore: FieldSettings,
    itemHeader: Pick<ItemIdentifierShared, "Prefill" | "ClientData">,
    valueBefore: FieldValue,
    propsBefore: FieldProps,
    reuseExecSpecs: FormulaExecutionSpecs,
    setUpdHelper: FieldSettingsUpdateHelper,
  ): RunFormulasResult {
    const l = this.log.fnIfInList('runOrInitSettings', 'fields', fieldName, { fieldName });
    const doLog = l.enabled;

    // Get the latest picker data and check if it has changed - as it affects which formulas to run
    const picker = this.#getPickerInfos(fieldName, fieldConstants, propsBefore);

    // Get the latest formulas. Use untracked() to avoid tracking the reading of the formula-cache
    // TODO: should probably use untracked around all the calls in this class...WIP 2dm
    const formulasAll = untracked(() => this.designerSvc.cache.getActive(this.entityGuid, fieldName, fieldConstants.inputTypeSpecs.isNewPicker, picker.pickerChanged));
    const splitDisabled = groupBy(formulasAll, f => f.disabled ? 'disabled' : 'enabled');
    if (splitDisabled.disabled)
      this.#showDisabledFormulasWarnings(splitDisabled.disabled);
    const formulas = splitDisabled.enabled ?? [];
    const hasFormulas = formulas.length > 0;

    // Run all formulas IF we have any and work with the objects containing specific changes
    const raw = (() => {
      // If we have no formulas, we need to set the value to the initial one as it might have been changed by formulas in the past
      if (!hasFormulas)
        return {
          value: valueBefore, validation: null, fields: [], settings: {},
          pickers: null, pickerOptionsVer: null, pickerSelectedVer: null
        };

      const runParamsStatic: Omit<FormulaRunParameters, 'formula'> = {
        currentValues,
        inputTypeName: fieldConstants.inputTypeSpecs.inputType,
        settingsInitial: fieldConstants.settingsInitial,
        settingsCurrent: settingsBefore,
        itemHeader,
        ...picker,
      };
  
      return this.#runAllOfField(runParamsStatic, formulas, reuseExecSpecs, doLog);
    })();

    // Correct any settings necessary after
    // possibly making invalid changes in formulas or if settings need to adjust
    // eg. custom bool labels which react to the value, etc.
    const settings = setUpdHelper.correctSettingsAfterChanges({ ...settingsBefore, ...raw.settings }, raw.value || valueBefore);

    const runFormulaResult: RunFormulasResult = {
      ...raw,
      settings,
    };
    return runFormulaResult;
  }

  #getPickerInfos(fieldName: string, fieldConstants: FieldConstantsOfLanguage, propsBefore: FieldProps): FormulaRunPickers {
    const l = this.log.fnIfInList('getPickerInfos', 'fields', fieldName, { fieldName });
    // Get the latest picker data and check if it has changed - as it affects which formulas to run
    const picker = fieldConstants.pickerData();
    const optionsRaw = picker?.optionsSource(); // must access before version check
    const optionsVer = getVersion(picker?.optionsSource);
    const optionsVerBefore = propsBefore.pickerVersion;
    const optionsChanged = optionsVer !== optionsVerBefore;

    const selectedRaw = picker?.selectedAll();
    const selectedVer = getVersion(picker?.selectedAll);
    const selectedVerBefore = propsBefore.pickerSelectedVerBefore;
    const selectedChanged = selectedVer !== selectedVerBefore;

    const result: FormulaRunPickers = {
      pickerOptionsRaw: optionsRaw,
      pickerOptions: picker?.optionsFinal(),
      pickerOptionsVer: optionsVer,
      pickerOptionsVerBefore: optionsVerBefore,
      pickerOptionsChanged: optionsChanged,

      // Selected
      pickerSelectedRaw: selectedRaw,
      pickerSelected: picker?.selectedState(),
      pickerSelectedVer: selectedVer,
      pickerSelectedVerBefore: selectedVerBefore,

      pickerChanged: selectedChanged || optionsChanged,
    };
    return l.r(result);
  }

  #showDisabledFormulasWarnings(disabled: FormulaCacheItem[]): void {
    for (const formula of disabled)
      console.warn(`Formula on field '${formula.fieldName}' with target '${formula.target}' is disabled. Reason: ${formula.disabledReason}`);
  }

  #runAllOfField(
    runParams: Omit<FormulaRunParameters, 'formula'>,
    formulas: FormulaCacheItem[],
    reuseObjectsForFormulaDataAndContext: FormulaExecutionSpecs,
    doLog: boolean,
  ): Omit<RunFormulasResult, "settings"> & { settings: Partial<FieldSettings> } {
    const l = this.log.fnCond(doLog, 'runFormulasOfField', { runParams, formulas });
    // Target variables to fill using formula result
    let value: FieldValue;                   // The new value
    let validation: FormulaFieldValidation;  // The new validation
    const fields: FieldValuePair[] = [];     // Any additional fields
    let pickers: PickerItem[] = null; // Any additional picker options
    let settingsNew: Record<string, any> = {};      // New settings - which can be updated multiple times by formulas

    const start = performance.now();
    for (const formula of formulas) {

      const allRunParams: FormulaExecutionSpecsWithRunParams = {
        runParameters: {
          formula,
          ...runParams,
        },
        ...reuseObjectsForFormulaDataAndContext
      };

      const formulaResult = this.#runFormula(allRunParams);

      // If result _contains_ a promise, add it to the queue but don't stop, as it can still contain settings/values for now
      const containsPromise = formulaResult?.promise instanceof Promise;
      if (containsPromise)
        this.promiseHandler.handleFormulaPromise(formulaResult, formula, runParams.inputTypeName);

      // Stop depends on explicit result and the default is different if it has a promise
      formula.stopFormula = formulaResult.stop ?? (containsPromise ? true : formula.stopFormula);

      // Pause depends on explicit result; TODO: MAYBE automatic on Pickers
      formula.pauseFormula = formulaResult.wait ?? formula.pauseFormula;
      formula.pausedVersion = runParams.pickerOptionsVer ?? -1;

      // If we have field changes, add to the list
      if (formulaResult.fields)
        fields.push(...formulaResult.fields);

      // new - experimental
      if (formulaResult.options)
        pickers = formulaResult.options;

      // If the value is not set, skip further result processing
      if (formulaResult.value === undefined)
        continue;

      // If we do have a value, we need to place it in the correct target
      // Target is the value. Remember it for later
      if (formula.isValue) {
        value = formulaResult.value;
        continue;
      }

      // Target is the validation. Remember it for later
      if (formula.isValidation) {
        validation = formulaResult.value as unknown as FormulaFieldValidation;
        continue;
      }

      // Target is a setting. Check validity and merge with other settings
      ({ settingsNew } = FormulaSettingsHelper.keepSettingIfTypeOk(formula.target, runParams.settingsCurrent, formulaResult.value, settingsNew));
    }
    const afterRun = performance.now();
    const result: Omit<RunFormulasResult, "settings"> & { settings: Partial<FieldSettings> } = {
      value,
      validation,
      fields,
      pickers,
      settings: settingsNew,
      pickerOptionsVer: runParams.pickerOptionsVer,
      pickerSelectedVer: runParams.pickerSelectedVer,
    };
    return l.r(result, 'runAllFormulas ' + `Time: ${afterRun - start}ms`);
  }

  /**
   * Used for running a single formula and returning the result.
   * @param formula
   * @param entityId
   * @param formValues
   * @param inputType
   * @param settingsInitial
   * @param settingsCurrent
   * @param itemIdWithPrefill
   * @returns Result of a single formula.
   */
  #runFormula(runParams: FormulaExecutionSpecsWithRunParams): FormulaResultRaw {

    const { formula, fieldName, params, title, devHelper, valHelper } = this.runOneHelper.getPartsFor(runParams);

    const l = this.log.fnIfInList('runFormula', 'fields', fieldName, { fieldName });

    l.a(`formula version: ${formula.version}, entity: ${title}, field: ${fieldName}, target: ${formula.target}`, {formula});
    try {
      devHelper.showStart();

      switch (formula.version) {
        // Formula V1
        case FormulaVersions.V1:
          const v1Raw = (formula.fn as FormulaFunctionV1)(params.data, params.context, params.experimental);
          const { ok, v1Result: valueV1 } = valHelper.v1(v1Raw);
          if (ok) {
            l.a('V1 formula result is pure', { v1Raw, valueV1 });
            devHelper.showResult(valueV1.value, false, false);
            return valueV1;
          }
          l.a('V1 formula result is not pure', { v1Raw });
          console.error('V1 formulas accept only simple values in return statements. If you need to return an complex object, use V2 formulas.');
          return valHelper.toFormulaResult(undefined);

        // Formula V2
        case FormulaVersions.V2:
          //TODO: @2dm -> Added item as last argument so if ew use experimental anywhere nothing breaks
          const v2Raw = (formula.fn as FormulaFunctionV1)(params.data, params.context, params.experimental);
          const v2Value = valHelper.v2(v2Raw);
          devHelper.showResult(v2Value.options as any ?? v2Value.value, false, !!v2Value.promise);
          // if (l.enabled) debugger;
          return v2Value;

        default:
          // default should never happen, so don't return any data to use; will probably error if this happens
          // 2024-09-10 2dm adding throw error here to see if it's anywhere
          // TODO: REMOVE option default everywhere ca. 2024-Q3
          throw new Error(`Formula version unknown not supported`);
          // const defRaw = (formula.fn as FormulaFunctionDefault)();
          // const defValue = valHelper.v2(defRaw);
          // devHelper.showResult(defValue.value, false, false);
          // return defValue;
      }
    } catch (error) {
      devHelper.showError(error);
      return valHelper.toFormulaResult(undefined);
    }
  }

}