import { Injectable, inject, untracked } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FeaturesService } from '../../features/features.service';
import { EavContentType, EavContentTypeAttribute } from '../shared/models/eav';
import { FormulaDesignerService } from './designer/formula-designer.service';
import { FormulaHelpers } from './formula.helpers';
import { FormulaFunctionDefault, FormulaFunctionV1, FormulaVersions } from './formula-definitions';
import { FormulaFieldValidation, FormulaNewPickerTargets, FormulaDefaultTargets, FormulaOptionalTargets } from './targets/formula-targets';
import { FormulaCacheItem } from './cache/formula-cache.model';
import { FormulaSettingsHelper } from './results/formula-settings.helper';
import { FormulaValueCorrections } from './results/formula-value-corrections.helper';
import { FormulaPromiseHandler } from './promise/formula-promise-handler';
import { RunFormulasResult, FormulaResultRaw, FieldValuePair } from './results/formula-results.models';
import { ItemIdentifierShared } from '../../shared/models/edit-form.model';
import { FormulaExecutionSpecsWithRunParams, FormulaExecutionSpecs, FormulaRunParameters } from './run/formula-objects-internal-data';
import { FieldSettingsUpdateHelper } from '../state/fields-settings-update.helpers';
import { FieldsSettingsHelpers } from '../state/field-settings.helper';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { EditInitializerService } from '../form/edit-initializer.service';
import { FieldsSettingsService } from '../state/fields-settings.service';
import { FormConfigService } from '../form/form-config.service';
import { LoggingService } from '../shared/services/logging.service';
import { FieldConstantsOfLanguage, FieldProps } from '../state/fields-configs.model';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { ItemService } from '../state/item.service';
import { LanguageService } from '../localization/language.service';
import { FieldsPropsEngine } from '../state/fields-properties-engine';
import { FieldsPropsEngineCycle } from '../state/fields-properties-engine-cycle';
import { classLog } from '../../shared/logging';
import { FormulaDeveloperHelper } from './formula-developer-helper';

const logSpecs = {
  // runFormulasForAllFields: false,
  fields: ['DefaultValue'],
};

function logDetailsFor(field: string) {
  return logSpecs.fields?.includes(field) || logSpecs.fields?.includes('*');
}

/**
 * Formula engine is responsible for running formulas and returning the result.
 *
 * Each instance of the engine is responsible for a _single_ entity.
 */
@Injectable()
export class FormulaEngine {
  log = classLog({ FormulaEngine }, logSpecs);

  #features = inject(FeaturesService).getAll();

  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private languageSvc: LanguageService,
    private designerSvc: FormulaDesignerService,
    private logSvc: LoggingService,
    private translate: TranslateService,
    private globalConfigSvc: GlobalConfigService,
    private editInitializerSvc: EditInitializerService,
  ) {
  }

  init(entityGuid: string, settingsSvc: FieldsSettingsService, promiseHandler: FormulaPromiseHandler, contentType: EavContentType, ctTitle: string) {
    this.#entityGuid = entityGuid;
    this.#settingsSvc = settingsSvc;
    this.#promiseHandler = promiseHandler;
    this.#attributes = contentType.Attributes;
    this.#contentTypeTitle = ctTitle;
  }

  // properties to set on init
  #entityGuid: string;
  #contentTypeTitle: string;
  #settingsSvc: FieldsSettingsService;
  #promiseHandler: FormulaPromiseHandler;
  #attributes: EavContentTypeAttribute[];

  /**
   * Find formulas of the current field which are still running.
   * Uses the designerService as that can modify the behavior while developing a formula.
   */
  #activeFieldFormulas(entityGuid: string, name: string, forListItems: boolean = false): FormulaCacheItem[] {
    const targets = forListItems
      ? Object.values(FormulaNewPickerTargets)
      : Object.values(FormulaDefaultTargets).concat(Object.values(FormulaOptionalTargets));
    return this.designerSvc.cache
      .getFormulas(entityGuid, name, targets, false)
      .filter(f => !f.stopFormula);
  }


  runFormulasForAllFields(engine: FieldsPropsEngine, cycle: FieldsPropsEngineCycle) {
    const fieldsProps: Record<string, FieldProps> = {};
    const valueUpdates: ItemValuesOfLanguage = {};
    const fieldUpdates: FieldValuePair[] = [];

    // Many aspects of a field are re-usable across formulas, so we prepare them here
    // These are things explicit to the entity and either never change, or only rarely
    // so never between cycles
    const reuseObjectsForFormulaDataAndContext = this.#prepareDataForFormulaObjects(engine.item.Entity.Guid);

    const fss = new FieldsSettingsHelpers(this.log.name);

    for (const attr of this.#attributes) {
      const values = cycle.allAttributes[attr.Name];
      const valueBefore = cycle.values[attr.Name];

      const fieldConstants = cycle.getFieldConstants(attr.Name);
      const latestSettings = cycle.getFieldSettingsInCycle(fieldConstants);
      const settingsUpdateHelper = cycle.updateHelper.create(attr, fieldConstants, values);

      // run formulas
      const formulaResult = this.#runAllFormulasOfFieldOrInitSettings(
        cycle,
        attr.Name,
        fieldConstants,
        latestSettings,
        engine.item.Header,
        valueBefore,
        reuseObjectsForFormulaDataAndContext,
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

      fieldsProps[attr.Name] = {
        language: fieldConstants.language,
        constants: fieldConstants,
        settings: fixed,
        translationState,
        buildValue: valueBefore,
        buildWrappers: null, // required, but set elsewhere
        formulaValidation: formulaResult.validation,
      };
    }
    return { fieldsProps, valueUpdates, fieldUpdates };
  }

  /**
   * Used for running all formulas for a given attribute/field.
   * @returns Object with all changes that formulas should make
   */
  #runAllFormulasOfFieldOrInitSettings(
    cycle: FieldsPropsEngineCycle,
    fieldName: string,
    constFieldPart: FieldConstantsOfLanguage,
    settingsBefore: FieldSettings,
    itemHeader: Pick<ItemIdentifierShared, "Prefill" | "ClientData">,
    valueBefore: FieldValue,
    reuseObjectsForFormulaDataAndContext: FormulaExecutionSpecs,
    setUpdHelper: FieldSettingsUpdateHelper,
  ): RunFormulasResult {
    const formulas = this.#activeFieldFormulas(this.#entityGuid, fieldName);
    const hasFormulas = formulas.length > 0;

    // Run all formulas IF we have any and work with the objects containing specific changes
    const { value, validation, fields, settings } = hasFormulas
      ? this.#runFormulasOfField(cycle, formulas, constFieldPart, settingsBefore, itemHeader, reuseObjectsForFormulaDataAndContext)
      : { value: valueBefore, validation: null, fields: [], settings: {} };

    // Correct any settings necessary after
    // possibly making invalid changes in formulas or if settings need to adjust
    // eg. custom bool labels which react to the value, etc.
    const updatedSettings = setUpdHelper.correctSettingsAfterChanges(
      { ...settingsBefore, ...settings },
      value || valueBefore
    );

    const runFormulaResult: RunFormulasResult = {
      settings: updatedSettings,
      validation: validation,
      value: value,
      fields: fields,
    };
    return runFormulaResult;
  }

  #runFormulasOfField(
    cycle: FieldsPropsEngineCycle,
    formulas: FormulaCacheItem[],
    constFieldPart: FieldConstantsOfLanguage,
    settingsCurrent: FieldSettings,
    itemHeader: Pick<ItemIdentifierShared, "Prefill" | "ClientData">,
    reuseObjectsForFormulaDataAndContext: FormulaExecutionSpecs,
  ): Omit<RunFormulasResult, "settings"> & { settings: Partial<FieldSettings> } {
    const l = this.log.fnCond(logDetailsFor(formulas[0]?.fieldName), 'runFormulasOfField');
    // Target variables to fill using formula result
    let value: FieldValue;                   // The new value
    let validation: FormulaFieldValidation;  // The new validation
    const fields: FieldValuePair[] = [];     // Any additional fields
    let settingsNew: Record<string, any> = {};      // New settings - which can be updated multiple times by formulas

    const start = performance.now();
    for (const formula of formulas) {
      if (formula.disabled) {
        console.warn(`Formula on field '${formula.fieldName}' with target '${formula.target}' is disabled. Reason: ${formula.disabledReason}`);
        // Show more debug in case of entity-pickers
        untracked(() => {
          if (formula.isValue) {
            console.log('value', { value: cycle.values[formula.fieldName], picker: 0, constFieldPart});
          }
        });
        continue;
      }

      const runParameters: FormulaRunParameters = {
        formula,
        currentValues: cycle.values,
        inputTypeName: constFieldPart.inputTypeSpecs.inputType,
        settingsInitial: constFieldPart.settingsInitial,
        settingsCurrent,
        itemHeader
      };
      const allRunParams: FormulaExecutionSpecsWithRunParams = { runParameters, ...reuseObjectsForFormulaDataAndContext };

      const formulaResult = this.#runFormula(allRunParams);

      // If result _contains_ a promise, add it to the queue but don't stop, as it can still contain settings/values for now
      const containsPromise = formulaResult?.promise instanceof Promise;
      if (containsPromise)
        this.#promiseHandler.handleFormulaPromise(formulaResult, formula, constFieldPart.inputTypeSpecs.inputType);

      // Stop depends on explicit result and the default is different if it has a promise
      formula.stopFormula = formulaResult.stop ?? (containsPromise ? true : formula.stopFormula);

      // If we have field changes, add to the list
      if (formulaResult.fields)
        fields.push(...formulaResult.fields);

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
      ({ settingsNew } = FormulaSettingsHelper.keepSettingIfTypeOk(formula.target, settingsCurrent, formulaResult.value, settingsNew));
    }
    const afterRun = performance.now();
    return l.r({ value, validation, fields, settings: settingsNew }, 'runAllFormulas ' + `Time: ${afterRun - start}ms`);
  }

  /**
   * Get all objects which are needed for the data and context and are reused quite a few times.
   * Can be reused for a short time, as the data doesn't change in a normal cycle,
   * but it will need to be regenerated after things such as language or feature change.
   */
  #prepareDataForFormulaObjects(entityGuid: string): FormulaExecutionSpecs {
    const language = this.formConfig.language();
    const languages = this.languageSvc.getAll();
    const debugEnabled = this.globalConfigSvc.isDebug();
    const initialFormValues = this.editInitializerSvc.getInitialValues(entityGuid, language.current);
    return {
      initialFormValues,
      language,
      languages,
      debugEnabled,
      itemService: this.itemService,
      formConfig: this.formConfig,
      fieldsSettingsSvc: this.#settingsSvc,
      features: this.#features,
    } satisfies FormulaExecutionSpecs;
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
    const { formula, item, inputTypeName } = runParams.runParameters;
    
    const l = this.log.fnCond(logDetailsFor(formula.fieldName), `runFormula`, { fieldName: formula.fieldName });

    const params = FormulaHelpers.buildFormulaProps(runParams);
    const ctTitle = this.#contentTypeTitle;
    const devHelper = new FormulaDeveloperHelper(this.designerSvc, this.translate, this.logSvc, formula, ctTitle, params);
    const valHelper = new FormulaValueCorrections(formula.isValue, inputTypeName, devHelper.isOpen);

    l.a(`formula version: ${formula.version}, entity: ${ctTitle}, field: ${formula.fieldName}, target: ${formula.target}`, {formula});
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
          devHelper.showResult(v2Value.value, false, !!v2Value.promise);
          return v2Value;

        default:  // TODO: not sure if this should ever be possible!
          const defRaw = (formula.fn as FormulaFunctionDefault)();
          const defValue = valHelper.v2(defRaw);
          devHelper.showResult(defValue.value, false, false);
          return defValue;
      }
    } catch (error) {
      devHelper.showError(error);
      return valHelper.toFormulaResult(undefined);
    }
  }

}

