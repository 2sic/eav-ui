import { untracked } from '@angular/core';
import { FormulaDesignerService } from './designer/formula-designer.service';
import { FormulaRunOneHelpersFactory } from './formula-run-one-helpers.factory';
import { FormulaFunctionV1, FormulaVersions } from './formula-definitions';
import { FormulaFieldValidation, FormulaSpecialPickerAutoSleep, FormulaSpecialPickerTargets } from './targets/formula-targets';
import { FormulaCacheItem } from './cache/formula-cache.model';
import { FormulaSettingsHelper } from './results/formula-settings.helper';
import { FormulaPromiseHandler } from './promise/formula-promise-handler';
import { RunFormulasResult, FormulaResultRaw } from './results/formula-results.models';
import { ItemIdentifierShared } from '../../shared/models/edit-form.model';
import { FormulaExecutionSpecsWithRunParams, FormulaExecutionSpecs, FormulaRunParameters, FormulaRunPickers, FormulaRunPicker } from './run/formula-objects-internal-data';
import { FieldSettingsUpdateHelper } from '../state/fields-settings-update.helpers';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { FieldConstantsOfLanguage, FieldProps, FieldPropsPicker } from '../state/fields-configs.model';
import { classLog } from '../../shared/logging';
import { getVersion } from '../../shared/signals/signal.utilities';
import groupBy from 'lodash-es/groupBy';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { logSpecsFormulaFields } from './formula-engine';
import { DebugFields } from '../edit-debug';

const logSpecs = {
  all: false,
  runFormula: false,
  runAllOfField: true,
  runOrInitSettings: true,
  getPickerInfos: false,
  fields: [...DebugFields, '*'], // will be replaced by shared list below
};

/**
 * Run all formulas of a single field.
 * Will also ensure that any settings are initialized properly if not yet created.
 */
export class FormulaRunField {

  log = classLog({FormulaRunField}, { ...logSpecs, fields: logSpecsFormulaFields }, true);

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
    const isSpecialPicker = fieldConstants.inputTypeSpecs.isNewPicker;
    const picks = this.#getPickerInfos(fieldName, fieldConstants, propsBefore);

    // Get the latest formulas. Use untracked() to avoid tracking the reading of the formula-cache
    // TODO: should probably use untracked around all the calls in this class...WIP 2dm
    const formulasAll = untracked(() => this.designerSvc.cache.getActive(this.entityGuid, fieldName, isSpecialPicker, picks.changed));
    const grouped = groupBy(formulasAll, f => f.disabled ? 'disabled' : 'enabled');
    if (grouped.disabled)
      this.#showDisabledFormulasWarnings(grouped.disabled);

    const enabled = grouped.enabled ?? [];

    // If we're working on the picker, but it's not ready yet, we must skip these formulas
    const formulas = isSpecialPicker && !picks.ready
      ? enabled.filter(f => !FormulaSpecialPickerTargets.includes(f.target))
      : enabled;
    
    l.a(`🧪📊formulas:${formulas.length}; pickerChanged: ${picks.changed}; opts: ${picks.options.changed}/${picks.options.ver}; sel: ${picks.selected.changed}/${picks.selected.ver}`);

    // If we have no formulas, exit early.
    if (formulas.length == 0)
      return finalize({}, valueBefore, {
        value: valueBefore, validation: null, fields: [], settings: {},
        opts: new FieldPropsPicker(), sel: new FieldPropsPicker(),
        //options: null, selected: null, optionsVer: null, selectedVer: null
      } satisfies RunFormulaPartialSettings);

    // Run all formulas IF we have any and work with the objects containing specific changes
    const runParamsStatic: Omit<FormulaRunParameters, 'formula'> = {
      currentValues,
      settingsInitial: fieldConstants.settingsInitial,
      settingsCurrent: settingsBefore,
      itemHeader,
      pickerInfo: picks,
    };
    const raw = this.#runAllOfField(runParamsStatic, formulas, reuseExecSpecs, doLog);

    return finalize(raw.settings, raw.value, raw);

    // Helper to finalize the result, needed to quit early and also when it really runs
    function finalize(settingsUpdate: Partial<FieldSettings>, value: FieldValue, raw: RunFormulaPartialSettings): RunFormulasResult {
      // Correct any settings necessary after
      // possibly making invalid changes in formulas or if settings need to adjust
      // eg. custom bool labels which react to the value, etc.
      const settings = setUpdHelper.correctSettingsAfterChanges({ ...settingsBefore, ...settingsUpdate }, value || valueBefore);
      return l.r({ ...raw, settings, } satisfies RunFormulasResult);
    }
  }

  #getPickerInfos(fieldName: string, fieldConstants: FieldConstantsOfLanguage, propsBefore: FieldProps): FormulaRunPickers {
    const l = this.log.fnIfInList('getPickerInfos', 'fields', fieldName);
    // Get the latest picker data and check if it has changed - as it affects which formulas to run
    const picker = fieldConstants.pickerData();
    if (picker?.ready() != true) {
      const dummy = { list: [], listRaw: [], ver: null, verBefore: null, changed: false, } as FormulaRunPicker;
      return { ready: false, mapper: null, picker, options: dummy, selected: dummy, changed: false, };
    }

    function getSpecs(cache: typeof picker.optionsRaw, final: typeof picker.optionsRaw, verBefore: number): FormulaRunPicker {
      const listRaw = cache(); // must access before version check
      const ver = getVersion(cache);
      return { list: final(), listRaw, ver, verBefore, changed: ver !== verBefore, } satisfies FormulaRunPicker;
    }
    const options = getSpecs(picker.optionsRaw, picker.optionsFinal, propsBefore.opts?.ver);
    const selected = getSpecs(picker.selectedRaw, picker.selectedAll, propsBefore.sel?.ver);

    const result: FormulaRunPickers = {
      ready: true,
      mapper: picker.state.mapper,
      picker,
      options,
      selected,
      changed: selected.changed || options.changed,
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
  ): RunFormulaPartialSettings {
    const l = this.log.fnIfInList('runAllOfField', 'fields', formulas[0].fieldName, { runParams, formulas });

    // Target variables to fill using formula result
    const wip: RunFormulaPartialSettings = {
      value: undefined,       // The new value
      validation: undefined,  // The new validation
      fields: [],             // Any additional fields
      opts: new FieldPropsPicker(), // { list: undefined, ver: undefined },             // Picker options
      sel: new FieldPropsPicker(), // { list: undefined, ver: undefined },              // Picker selected
      settings: {},           // New settings - which can be updated multiple times by formulas
    };

    const start = performance.now();
    for (const formula of formulas) {

      const allRunParams: FormulaExecutionSpecsWithRunParams = {
        runParameters: { formula, ...runParams, },
        ...reuseObjectsForFormulaDataAndContext
      };

      const raw = this.#runFormula(allRunParams);

      // If result _contains_ a promise, add it to the queue
      // but don't stop, as it can still contain settings/values for now
      const containsPromise = raw.promise instanceof Promise;
      if (containsPromise)
        this.promiseHandler.handleFormulaPromise(raw, formula);

      // Stop depends on explicit result and the default is different if it has a promise
      formula.stop = raw.stop ?? (containsPromise ? true : formula.stop);

      // Pause depends on explicit result
      formula.sleep = raw.sleep ?? (FormulaSpecialPickerAutoSleep.includes(formula.target) ? true : formula.sleep);
      l.a(`🧪⏸️formula.sleep: ${formula.target}; formula.sleep: ${formula.sleep}; raw.sleep: ${raw.sleep}`);

      // If we have field changes, add to the list
      if (raw.fields) wip.fields.push(...raw.fields);

      // picker data results - experimental v18
      if (raw.options) {
        wip.opts = { list: raw.options, ver: runParams.pickerInfo.options.ver };
        l.a(`🧪📃 options returned, will add`, wip.opts as unknown as Record<string, unknown>);
      }
      if (raw.selected) {
        wip.sel = { list: raw.selected, ver: runParams.pickerInfo.selected.ver };
        l.a(`🧪📃 selected returned, will add`, wip.sel as unknown as Record<string, unknown>);
      }
        

      // If the value is not set, skip further result processing
      if (raw.value === undefined)
        continue;

      // If we do have a value, we need to place it in the correct target
      switch (true) {
        // Target is the value. Remember it for later
        case formula.isValue:
          wip.value = raw.value;
          break;

        // Target is the validation. Remember it for later
        case formula.isValidation:
          wip.validation = raw.value as unknown as FormulaFieldValidation;
          break;

        // Target is a setting. Check validity and merge with other settings
        case formula.isSetting:
          wip.settings = FormulaSettingsHelper.keepSettingIfTypeOk(formula.target, runParams.settingsCurrent, raw.value, wip.settings);
          break;
      }
    }
    const afterRun = performance.now();

    return l.r(wip, `runAllFormulas Time: ${afterRun - start}ms`);
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
  #runFormula(execSpecs: FormulaExecutionSpecsWithRunParams): FormulaResultRaw {

    const { formula, fieldName, params, title, devHelper, valHelper } = this.runOneHelper.getPartsFor(execSpecs);

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

type RunFormulaPartialSettings = Omit<RunFormulasResult, "settings"> & { settings: Partial<FieldSettings> };