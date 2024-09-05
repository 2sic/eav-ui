import { Injectable, Signal, inject, untracked } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FeaturesService } from '../../features/features.service';
import { EavContentType } from '../shared/models/eav';
import { FormulaDesignerService } from './designer/formula-designer.service';
import { FormulaHelpers } from './formula.helpers';
import { FormulaFunctionDefault, FormulaFunctionV1, FormulaVersions } from './formula-definitions';
import { FormulaFieldValidation, FormulaNewPickerTargets, FormulaDefaultTargets, FormulaTargets, FormulaOptionalTargets } from './targets/formula-targets';
import { FormulaCacheItem } from './cache/formula-cache.model';
import { FormulaSettingsHelper } from './results/formula-settings.helper';
import { FormulaValueCorrections } from './results/formula-value-corrections.helper';
import { FormulaPromiseHandler } from './promise/formula-promise-handler';
import { RunFormulasResult, FormulaResultRaw, FieldValuePair } from './results/formula-results.models';
import { ItemIdentifierShared } from '../../shared/models/edit-form.model';
import { EavLogger } from '../../shared/logging/eav-logger';
import { FormulaObjectsInternalData, FormulaExecutionSpecs, FormulaRunParameters } from './run/formula-objects-internal-data';
import { FieldSettingsUpdateHelper } from '../state/fields-settings-update.helpers';
import { FieldsSettingsHelpers } from '../state/fields-settings.helpers';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { EditInitializerService } from '../state/edit-initializer.service';
import { FieldsSettingsService } from '../state/fields-settings.service';
import { FormConfigService } from '../state/form-config.service';
import { LoggingService, LogSeverities } from '../shared/services/logging.service';
import { FieldConstantsOfLanguage, FieldProps } from '../state/fields-configs.model';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { ContentTypeSettings } from '../state/content-type-settings.model';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { ItemService } from '../shared/store/item.service';
import { LanguageService } from '../shared/store/language.service';
import { FieldsPropsEngine } from '../state/fields-properties-engine';
import { FieldsPropsEngineCycle } from '../state/fields-properties-engine-cycle';

const logSpecs = {
  enabled: false,
  name: 'FormulaEngine',
  specs: {
    fields: ['UiGroup'],
  }
};

function logDetailsFor(field: string) {
  return logSpecs.specs.fields?.includes(field) || logSpecs.specs.fields?.includes('*');
}

/**
 * Formula engine is responsible for running formulas and returning the result.
 *
 * Each instance of the engine is responsible for a _single_ entity.
 */
@Injectable()
export class FormulaEngine {
  private features = inject(FeaturesService).getAll();

  log = new EavLogger(logSpecs);
  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private languageService: LanguageService,
    private designerSvc: FormulaDesignerService,
    private logSvc: LoggingService,
    private translate: TranslateService,
    private globalConfigService: GlobalConfigService,
    private editInitializerService: EditInitializerService,
  ) {
  }

  init(entityGuid: string, settingsSvc: FieldsSettingsService, promiseHandler: FormulaPromiseHandler, contentType: EavContentType, ctSettings: Signal<ContentTypeSettings>) {
    this.entityGuid = entityGuid;
    this.settingsSvc = settingsSvc;
    this.promiseHandler = promiseHandler;
    this.contentType = contentType;
    this.contentTypeSettings = ctSettings;
  }

  // properties to set on init
  private entityGuid: string;
  private contentType: EavContentType;
  private contentTypeSettings: Signal<ContentTypeSettings>;
  private settingsSvc: FieldsSettingsService;
  private promiseHandler: FormulaPromiseHandler;

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

    for (const attr of this.contentType.Attributes) {
      const attrValues = cycle.allAttributes[attr.Name];
      const valueBefore = cycle.values[attr.Name];
      const constFieldPart = cycle.getFieldConstants(attr.Name);

      const latestSettings: FieldSettings = cycle.getFieldSettingsInCycle(constFieldPart);

      const settingsUpdateHelper = cycle.updateHelper.create(attr, constFieldPart, attrValues);

      // run formulas
      const formulaResult = this.#runAllFormulasOfFieldOrInitSettings(
        cycle,
        attr.Name,
        constFieldPart,
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

      const translationState = FieldsSettingsHelpers.getTranslationState(attrValues, fixed.DisableTranslation, engine.languages);

      fieldsProps[attr.Name] = {
        language: constFieldPart.language,
        constants: constFieldPart,
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
    const formulas = this.#activeFieldFormulas(this.entityGuid, fieldName);
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
        if (formula.target === FormulaTargets.Value)
          console.log('value', { value: cycle.values[formula.fieldName] });
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
      const allObjectParameters: FormulaObjectsInternalData = { runParameters, ...reuseObjectsForFormulaDataAndContext };

      const formulaResult = this.#runFormula(allObjectParameters);

      // If result _contains_ a promise, add it to the queue but don't stop, as it can still contain settings/values for now
      const containsPromise = formulaResult?.promise instanceof Promise;
      if (containsPromise)
        this.promiseHandler.handleFormulaPromise(formulaResult, formula, constFieldPart.inputTypeSpecs.inputType);

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
      if (formula.target === FormulaTargets.Value) {
        value = formulaResult.value;
        continue;
      }

      // Target is the validation. Remember it for later
      if (formula.target === FormulaTargets.Validation) {
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
    const languages = this.languageService.getAll();
    const debugEnabled = this.globalConfigService.isDebug();
    const initialFormValues = this.editInitializerService.getInitialValues(entityGuid, language.current);
    return {
      initialFormValues,
      language,
      languages,
      debugEnabled,
      itemService: this.itemService,
      formConfig: this.formConfig,
      fieldsSettingsService: this.settingsSvc,
      features: this.features,
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
  #runFormula(allObjectsForDataAndContext: FormulaObjectsInternalData): FormulaResultRaw {
    const { formula, item, inputTypeName } = allObjectsForDataAndContext.runParameters;
    
    const l = this.log.fnCond(logDetailsFor(formula.fieldName), `runFormula`, { fieldName: formula.fieldName });

    const formulaProps = FormulaHelpers.buildFormulaProps(allObjectsForDataAndContext);

    const isOpenInDesigner = this.#isDesignerOpen(formula);
    const ctTitle = this.contentTypeSettings()._itemTitle;
    l.a(`formula version: ${formula.version}, entity: ${ctTitle}, field: ${formula.fieldName}, target: ${formula.target}`, {formula});
    try {
      switch (formula.version) {
        // Formula V1
        case FormulaVersions.V1:
          if (isOpenInDesigner)
            console.log(`Running formula${formula.version.toLocaleUpperCase()} for Entity: "${ctTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, formulaProps);

          const v1Result = (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental, item);
          const isArray = v1Result && Array.isArray(v1Result) && (v1Result as any).every((r: any) => typeof r === 'string');
          const resultIsPure = ['string', 'number', 'boolean'].includes(typeof v1Result) || v1Result instanceof Date || isArray || !v1Result;
          if (resultIsPure) {
            l.a('V1 formula result is pure', { v1Result });
            const v1Value = (formula.target === FormulaTargets.Value)
              ? FormulaValueCorrections.correctOneValue(v1Result as FieldValue, inputTypeName)
              : v1Result as FieldValue;
            this.designerSvc.cache.cacheResults(formula, v1Value, false, false);
            if (isOpenInDesigner)
              console.log('Formula result:', v1Value);
            return {
              value: v1Value,
              fields: [],
              stop: null,
              openInDesigner: isOpenInDesigner
            } satisfies FormulaResultRaw;
          }
          l.a('V1 formula result is not pure', { v1Result });
          console.error('V1 formulas accept only simple values in return statements. If you need to return an complex object, use V2 formulas.');
          return {
            value: undefined,
            fields: [],
            stop: null,
            openInDesigner: isOpenInDesigner
          } satisfies FormulaResultRaw;

        // Formula V2
        case FormulaVersions.V2:
          if (isOpenInDesigner)
            console.log(`Running formula${formula.version.toLocaleUpperCase()} for Entity: "${ctTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, formulaProps);

          //TODO: @2dm -> Added item as last argument so if ew use experimental anywhere nothing breaks
          const v2Result = (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental, item);

          const valueV2 = FormulaValueCorrections.correctAllValues(formula.target, v2Result, inputTypeName);
          valueV2.openInDesigner = isOpenInDesigner;
          this.designerSvc.cache.cacheResults(formula, valueV2.value, false, !!valueV2.promise);
          if (isOpenInDesigner)
            console.log('Formula result:', valueV2.value);
          return valueV2;

        default:
          if (isOpenInDesigner)
            console.log(`Running formula for Entity: "${ctTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, undefined);
          const resultDef = (formula.fn as FormulaFunctionDefault)();
          const valueDef = FormulaValueCorrections.correctAllValues(formula.target, resultDef, inputTypeName);
          valueDef.openInDesigner = isOpenInDesigner;
          this.designerSvc.cache.cacheResults(formula, valueDef.value, false, false);
          if (isOpenInDesigner)
            console.log('Formula result:', valueDef);
          return valueDef;
      }
    } catch (error) {
      const errorLabel = `Error in formula calculation for Entity: "${ctTitle}", Field: "${formula.fieldName}", Target: "${formula.target}"`;
      this.designerSvc.cache.cacheResults(formula, undefined, true, false);
      this.logSvc.addLog(LogSeverities.Error, errorLabel, error);
      if (isOpenInDesigner)
        console.error(errorLabel, error);
      else
        this.logSvc.showMessage(this.translate.instant('Errors.FormulaCalculation'), 2000);
      return {
        value: undefined,
        fields: [],
        stop: null,
        openInDesigner: isOpenInDesigner,
      } satisfies FormulaResultRaw;
    }
  }

  /**
   * Used for checking if the currently running formula is open in designer.
   * @param f
   * @returns True if formula is open in designer, otherwise false
   */
  #isDesignerOpen(f: FormulaCacheItem): boolean {
    return untracked(() => {
      const ds = this.designerSvc.designerState();
      const isOpenInDesigner = ds.isOpen && ds.entityGuid === f.entityGuid && ds.fieldName === f.fieldName && ds.target === f.target;
      return isOpenInDesigner;
    });
  }
}

