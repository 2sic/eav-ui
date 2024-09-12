import { Injectable, untracked } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EavContentType, EavContentTypeAttribute } from '../shared/models/eav';
import { FormulaDesignerService } from './designer/formula-designer.service';
import { FormulaRunOneHelpersFactory } from './formula-run-one-helpers.factory';
import { FormulaFunctionV1, FormulaVersions } from './formula-definitions';
import { FormulaFieldValidation } from './targets/formula-targets';
import { FormulaCacheItem } from './cache/formula-cache.model';
import { FormulaSettingsHelper } from './results/formula-settings.helper';
import { FormulaPromiseHandler } from './promise/formula-promise-handler';
import { RunFormulasResult, FormulaResultRaw, FieldValuePair } from './results/formula-results.models';
import { ItemIdentifierShared } from '../../shared/models/edit-form.model';
import { FormulaExecutionSpecsWithRunParams, FormulaExecutionSpecs, FormulaRunParameters } from './run/formula-objects-internal-data';
import { FieldSettingsUpdateHelper } from '../state/fields-settings-update.helpers';
import { FieldsSettingsHelpers } from '../state/field-settings.helper';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { FieldsSettingsService } from '../state/fields-settings.service';
import { LoggingService } from '../shared/services/logging.service';
import { FieldConstantsOfLanguage, FieldProps } from '../state/fields-configs.model';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { FieldsPropsEngine } from '../state/fields-properties-engine';
import { FieldsPropsEngineCycle } from '../state/fields-properties-engine-cycle';
import { classLog } from '../../shared/logging';
import { PickerItem } from '../fields/picker/models/picker-item.model';
import { getVersion } from '../../shared/signals/signal.utilities';
import { FormulaExecutionSpecsFactory } from './formula-exec-specs.factory';
import { transient } from '../../core';
import groupBy from 'lodash-es/groupBy';

const logSpecs = {
  all: false,
  getFormulas: true,
  runAllFields: false,
  runFormula: false,
  runOneFieldOrInitSettings: true,
  fields: ['StringPicker'], // or '*' for all
};

/**
 * Formula engine is responsible for running formulas and returning the result.
 *
 * Each instance of the engine is responsible for a _single_ entity.
 */
@Injectable()
export class FormulaEngine {

  log = classLog({FormulaEngine}, logSpecs, true);

  #formulaExecSpecsFactory = transient(FormulaExecutionSpecsFactory);

  constructor(
    private designerSvc: FormulaDesignerService,
    private logSvc: LoggingService,
    private translate: TranslateService,
  ) { }

  init(entityGuid: string, settingsSvc: FieldsSettingsService, promiseHandler: FormulaPromiseHandler, contentType: EavContentType, ctTitle: string) {
    this.#entityGuid = entityGuid;
    this.#promiseHandler = promiseHandler;
    this.#attributes = contentType.Attributes;
    this.#contentTypeTitle = ctTitle;
    this.#formulaExecSpecsFactory.init(entityGuid, settingsSvc);
  }

  // properties to set on init
  #entityGuid: string;
  #contentTypeTitle: string;
  #promiseHandler: FormulaPromiseHandler;
  #attributes: EavContentTypeAttribute[];

  runAllFields(engine: FieldsPropsEngine, cycle: FieldsPropsEngineCycle) {
    const fieldsProps: Record<string, FieldProps> = {};
    const valueUpdates: ItemValuesOfLanguage = {};
    const fieldUpdates: FieldValuePair[] = [];

    // Many aspects of a field are re-usable across formulas, so we prepare them here
    // These are things explicit to the entity and either never change, or only rarely
    // so never between cycles
    const reuseExecSpecs = this.#formulaExecSpecsFactory.getSharedSpecs();

    const fss = new FieldsSettingsHelpers(this.log.name);

    for (const attr of this.#attributes) {
      const lAttr = this.log.fnIfInList('runAllFields', 'fields', attr.Name, { fieldName: attr.Name });
      const values = cycle.allAttributes[attr.Name];
      const valueBefore = cycle.values[attr.Name];

      const fieldConstants = cycle.getFieldConstants(attr.Name);
      const latestSettings = cycle.getFieldSettingsInCycle(fieldConstants);
      const settingsUpdateHelper = cycle.updateHelper.create(attr, fieldConstants, values);

      const propsBefore = cycle.fieldProps[attr.Name] ?? {} as FieldProps;

      // run formulas
      const formulaResult = this.#runOneFieldOrInitSettings(
        cycle,
        attr.Name,
        fieldConstants,
        latestSettings,
        engine.item.Header,
        valueBefore,
        propsBefore,
        reuseExecSpecs,
        settingsUpdateHelper,
      );

      const fixed = formulaResult.settings;

      // Add any value changes to the queue for finalizing
      valueUpdates[attr.Name] = formulaResult.value;

      // If _other_ fields were updated, add it to the queue for later processing
      if (formulaResult.fields)
        fieldUpdates.push(...formulaResult.fields);

      const debugDetails = this.log.specs.fields?.includes(attr.Name) || this.log.specs.fields?.includes('*');
      const translationState = fss.getTranslationState(values, fixed.DisableTranslation, engine.languages, debugDetails);

      const pickerOptions = formulaResult.pickers;
      if (pickerOptions)
        lAttr.a('picker options', { pickerOptions, version: formulaResult.pickerVersion });

      fieldsProps[attr.Name] = {
        ...propsBefore,
        language: fieldConstants.language,
        constants: fieldConstants,
        settings: fixed,
        translationState,
        buildValue: valueBefore,
        buildWrappers: null, // required, but set elsewhere
        formulaValidation: formulaResult.validation,
        pickerOptions: pickerOptions ?? propsBefore.pickerOptions,
        pickerVersion: formulaResult.pickerVersion ?? propsBefore.pickerVersion,
      };
    }
    return { fieldsProps, valueUpdates, fieldUpdates };
  }

  /**
   * Used for running all formulas for a given attribute/field.
   * @returns Object with all changes that formulas should make
   */
  #runOneFieldOrInitSettings(
    cycle: FieldsPropsEngineCycle,
    fieldName: string,
    fieldConstants: FieldConstantsOfLanguage,
    settingsBefore: FieldSettings,
    itemHeader: Pick<ItemIdentifierShared, "Prefill" | "ClientData">,
    valueBefore: FieldValue,
    propsBefore: FieldProps,
    reuseExecSpecs: FormulaExecutionSpecs,
    setUpdHelper: FieldSettingsUpdateHelper,
  ): RunFormulasResult {
    const l = this.log.fnIfInList('runOneFieldOrInitSettings', 'fields', fieldName, { fieldName });
    const doLog = l.enabled;

    // Get the latest picker data and check if it has changed - as it affects which formulas to run
    const picker = fieldConstants.pickerData();
    const pickerRaw = picker?.optionsSource(); // must access before version check
    const pickerVersion = getVersion(picker?.optionsSource);
    const pickerVersionBefore = propsBefore.pickerVersion;
    const hasChanged = pickerVersion !== pickerVersionBefore;
    l.a('picker version', { pickerVersion, pickerVersionBefore, hasChanged });

    // Get the latest formulas. Use untracked() to avoid tracking the reading of the formula-cache
    const formulasAll = untracked(() => this.designerSvc.cache.getActive(this.#entityGuid, fieldName, fieldConstants.inputTypeSpecs.isNewPicker, hasChanged));
    const splitDisabled = groupBy(formulasAll, f => f.disabled ? 'disabled' : 'enabled');
    if (splitDisabled.disabled)
      this.#showDisabledFormulasWarnings(splitDisabled.disabled);
    const formulas = splitDisabled.enabled ?? [];
    const hasFormulas = formulas.length > 0;

    // Run all formulas IF we have any and work with the objects containing specific changes
    const raw = (() => {
      // If we have no formulas, we need to set the value to the initial one as it might have been changed by formulas in the past
      if (!hasFormulas)
        return { value: valueBefore, validation: null, fields: [], settings: {}, pickers: null, pickerVersion: null };

      const runParamsStatic: Omit<FormulaRunParameters, 'formula'> = {
        currentValues: cycle.values,
        inputTypeName: fieldConstants.inputTypeSpecs.inputType,
        settingsInitial: fieldConstants.settingsInitial,
        settingsCurrent: settingsBefore,
        itemHeader,
        pickerRaw,
        pickerOptions: picker?.optionsFinal(),
        pickerVersion,
        pickerVersionBefore: pickerVersionBefore,
      };

      const runOneHelper = new FormulaRunOneHelpersFactory(this.designerSvc, this.translate, this.logSvc, this.#contentTypeTitle);
  
      return this.#runAllOfField(runParamsStatic, formulas, reuseExecSpecs, runOneHelper, doLog);
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

  #showDisabledFormulasWarnings(disabled: FormulaCacheItem[]): void {
    for (const formula of disabled)
      console.warn(`Formula on field '${formula.fieldName}' with target '${formula.target}' is disabled. Reason: ${formula.disabledReason}`);
  }

  #runAllOfField(
    runParams: Omit<FormulaRunParameters, 'formula'>,
    formulas: FormulaCacheItem[],
    reuseObjectsForFormulaDataAndContext: FormulaExecutionSpecs,
    runOneHelper: FormulaRunOneHelpersFactory,
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

      const formulaResult = this.#runFormula(allRunParams, runOneHelper);

      // If result _contains_ a promise, add it to the queue but don't stop, as it can still contain settings/values for now
      const containsPromise = formulaResult?.promise instanceof Promise;
      if (containsPromise)
        this.#promiseHandler.handleFormulaPromise(formulaResult, formula, runParams.inputTypeName);

      // Stop depends on explicit result and the default is different if it has a promise
      formula.stopFormula = formulaResult.stop ?? (containsPromise ? true : formula.stopFormula);

      // Pause depends on explicit result; TODO: MAYBE automatic on Pickers
      formula.pauseFormula = formulaResult.wait ?? formula.pauseFormula;
      formula.pausedVersion = runParams.pickerVersion ?? -1;

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
    return l.r({ value, validation, fields, settings: settingsNew, pickers, pickerVersion: runParams.pickerVersion }, 'runAllFormulas ' + `Time: ${afterRun - start}ms`);
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
  #runFormula(runParams: FormulaExecutionSpecsWithRunParams, runOneHelper: FormulaRunOneHelpersFactory): FormulaResultRaw {

    const { formula, fieldName, params, title, devHelper, valHelper } = runOneHelper.getPartsFor(runParams);

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

