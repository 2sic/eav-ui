import { Injectable, OnDestroy, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FieldSettings, FieldValue, PickerItem } from 'projects/edit-types';
import { BehaviorSubject } from 'rxjs';
import { InputType } from '../../content-type-fields/models/input-type.model';
import { FeaturesService } from '../../shared/services/features.service';
import { EntityReader, FieldSettingsDisabledBecauseOfLanguageHelper } from '../shared/helpers';
import { ContentTypeSettings, FormValues, LogSeverities } from '../shared/models';
import { EavContentTypeAttribute, EavEntity, EavField } from '../shared/models/eav';
import { FormConfigService, EditInitializerService, FieldsSettingsService, LoggingService } from '../shared/services';
import { GlobalConfigService, ItemService, LanguageService } from '../shared/store/ngrx-data';
import { FormulaDesignerService } from './formula-designer.service';
import { FormulaHelpers } from './helpers/formula.helpers';
// tslint:disable-next-line: max-line-length
import { FormulaCacheItem, FormulaFieldValidation, FormulaFunctionDefault, FormulaFunctionV1, FormulaListItemTargets, FormulaDefaultTargets, FormulaTargets, FormulaVersions, FormulaOptionalTargets } from './models/formula.models';
import { FormulaSettingsHelper } from './helpers/formula-settings.helper';
import { FieldLogicBase } from '../form/shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../form/shared/field-logic/field-logic-tools';
import { FormulaValueCorrections } from './helpers/formula-value-corrections.helper';
import { FormulaPromiseHandler } from './formula-promise-handler';
import { RunFormulasResult, FormulaResultRaw, FieldValuePair } from './models/formula-results.models';
import { ItemIdentifierShared } from '../../shared/models/edit-form.model';
import { ServiceBase } from '../../shared/services/service-base';
import { EavLogger } from '../../shared/logging/eav-logger';
import { FormulaObjectsInternalData, FormulaObjectsInternalWithoutFormulaItself } from './helpers/formula-objects-internal-data';

const logThis = true;
const nameOfThis = 'FormulaEngine';
/**
 * Formula engine is responsible for running formulas and returning the result.
 * 
 * Each instance of the engine is responsible for a _single_ entity.
 */
@Injectable()
export class FormulaEngine extends ServiceBase implements OnDestroy {
  private features = inject(FeaturesService).getAll();
  private contentTypeSettings$: BehaviorSubject<ContentTypeSettings>;
  private settingsSvc: FieldsSettingsService = null;
  private promiseHandler: FormulaPromiseHandler = null;

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
    super(new EavLogger(nameOfThis, logThis));
  }

  ngOnDestroy(): void {
    super.destroy();
  }

  init(settingsSvc: FieldsSettingsService, promiseHandler: FormulaPromiseHandler, contentTypeSettings$: BehaviorSubject<ContentTypeSettings>) {
    this.settingsSvc = settingsSvc;
    this.promiseHandler = promiseHandler;
    this.contentTypeSettings$ = contentTypeSettings$;
  }

  // TODO: 2dm -> Here we call all list item formulas on some picker for each item
  /**
   * Used for running all list item formulas for a given attribute/field.
   * @param entityGuid
   * @param entityId
   * @param attribute
   * @param formValues
   * @param inputType
   * @param settingsInitial
   * @param settingsCurrent
   * @param itemIdWithPrefill
   * @param availableItems
   * @returns List of processed picker items
   */
  runAllListItemsFormulas(
    entityGuid: string,
    attribute: EavContentTypeAttribute,
    formValues: FormValues,
    inputType: InputType,
    settingsInitial: FieldSettings,
    settingsCurrent: FieldSettings,
    itemIdWithPrefill: ItemIdentifierShared,
    availableItems: PickerItem[],
  ): PickerItem[] {
    const formulas = this.designerSvc.cache
      .getFormulas(entityGuid, attribute.Name, Object.values(FormulaListItemTargets), false)
      .filter(f => !f.stopFormula);

    if (formulas.length === 0)
      return availableItems;

    const reuseParameters: Omit<FormulaRunParameters, 'formula'> = { formValues, inputType, settingsInitial, settingsCurrent, itemIdWithPrefill };

    const reuseObjectsForDataAndContext = this.prepareDataForFormulaObjects(entityGuid);

    for (const formula of formulas)
      for (const item of availableItems) {
        const runParameters: FormulaRunParameters = { formula, ...reuseParameters };
        const allObjectParameters: FormulaObjectsInternalData = { runParameters, ...reuseObjectsForDataAndContext };
          const result = this.runFormula(allObjectParameters);

        switch (formula.target) {
          case FormulaTargets.ListItemLabel:
            item.label = result.value as string;
            break;
          case FormulaTargets.ListItemDisabled:
            item.notSelectable = result.value as boolean;
            break;
          case FormulaTargets.ListItemTooltip:
            item.tooltip = result.value as string;
            break;
          case FormulaTargets.ListItemInformation:
            item.infoBox = result.value as string;
            break;
          case FormulaTargets.ListItemHelpLink:
            item.helpLink = result.value as string;
            break;
        }
      }
    return availableItems;
  }

  /**
   * Used for running all formulas for a given attribute/field.
   * @returns Object with all changes that formulas should make
   */
  runAllFormulasOfField(
    entityGuid: string,
    attribute: EavContentTypeAttribute,
    formValues: FormValues,
    inputType: InputType,
    logic: FieldLogicBase,
    settingsInitial: FieldSettings,
    settingsCurrent: FieldSettings,
    itemIdWithPrefill: ItemIdentifierShared,
    // contentTypeMetadata: EavEntity[],
    // attributeValues: EavField<any>,
    // entityReader: EntityReader,
    slotIsEmpty: boolean,
    formReadOnly: boolean,
    valueBefore: FieldValue,
    logicTools: FieldLogicTools,
    reuseObjectsForFormulaDataAndContext: FormulaObjectsInternalWithoutFormulaItself,
    disabledHelper: FieldSettingsDisabledBecauseOfLanguageHelper,
  ): RunFormulasResult {
    //TODO: @2dm -> Here for target I send all targets except listItem targets, used to be "null" before
    const formulas = this.designerSvc.cache
      .getFormulas(entityGuid, attribute.Name, Object.values(FormulaDefaultTargets).concat(Object.values(FormulaOptionalTargets)), false)
      .filter(f => !f.stopFormula);

    let formulaValue: FieldValue;
    let formulaValidation: FormulaFieldValidation;
    const formulaFields: FieldValuePair[] = [];
    const settingsNew: Record<string, any> = {};

    const reuseParameters: Omit<FormulaRunParameters, 'formula'> = { formValues, inputType, settingsInitial, settingsCurrent, itemIdWithPrefill };

    const start = performance.now();
    for (const formula of formulas) {
      const runParameters: FormulaRunParameters = { formula, ...reuseParameters };
      const allObjectParameters: FormulaObjectsInternalData = { runParameters, ...reuseObjectsForFormulaDataAndContext };
      const formulaResult = this.runFormula(allObjectParameters);
      if (formulaResult?.promise instanceof Promise) {
        this.promiseHandler.handleFormulaPromise(entityGuid, formulaResult, formula, inputType);
        formula.stopFormula = formulaResult.stop ?? true;
      } else
        formula.stopFormula = formulaResult.stop ?? formula.stopFormula;

      if (formulaResult.fields)
        formulaFields.push(...formulaResult.fields);

      if (formulaResult.value === undefined)
        continue;

      if (formula.target === FormulaTargets.Value) {
        formulaValue = formulaResult.value;
        continue;
      }

      if (formula.target === FormulaTargets.Validation) {
        formulaValidation = formulaResult.value as unknown as FormulaFieldValidation;
        continue;
      }

      FormulaSettingsHelper.keepSettingsIfTypeMatches(formula.target, settingsCurrent, formulaResult.value, settingsNew);
    }
    const afterRun = performance.now();
    this.log.a('runAllFormulas ' + `Time: ${afterRun - start}ms`);

    const updatedSettings = disabledHelper.ensureNewSettingsMatchRequirements(
      // settingsInitial,
      {
        ...settingsCurrent,
        ...settingsNew,
      },
      // attribute,
      // contentTypeMetadata,
      // inputType,
      // logic,
      // attributeValues,
      // entityReader,
      // slotIsEmpty,
      // formReadOnly,
      valueBefore,
      // logicTools,
    );

    const runFormulaResult: RunFormulasResult = {
      settings: updatedSettings,
      validation: formulaValidation,
      value: formulaValue,
      fields: formulaFields,
    };
    return runFormulaResult;
  }

  /**
   * Get all objects which are needed for the data and context and are reused quite a few times.
   * Can be reused for a short time, as the data doesn't change in a normal cycle,
   * but it will need to be regenerated after things such as language or feature change.
   */
  prepareDataForFormulaObjects(entityGuid: string): FormulaObjectsInternalWithoutFormulaItself {
    const language = this.formConfig.language();
    const languages = this.languageService.getLanguages();
    const debugEnabled = this.globalConfigService.isDebug();
    const initialFormValues = this.editInitializerService.getInitialValues(entityGuid, language.current);
    const formulaObjectsInternalData: FormulaObjectsInternalWithoutFormulaItself = {
      initialFormValues,
      language,
      languages,
      debugEnabled,
      itemService: this.itemService,
      formConfig: this.formConfig,
      fieldsSettingsService: this.settingsSvc,
      features: this.features,
    };
    return formulaObjectsInternalData;    
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
  private runFormula(allObjectsForDataAndContext: FormulaObjectsInternalData): FormulaResultRaw {
    const { formula, inputType, item } = allObjectsForDataAndContext.runParameters;

    const formulaProps = FormulaHelpers.buildFormulaProps(allObjectsForDataAndContext);

    const isOpenInDesigner = this.isDesignerOpen(formula);
    const ctSettings = this.contentTypeSettings$.value;
    try {
      switch (formula.version) {
        case FormulaVersions.V1:
          if (isOpenInDesigner)
            console.log(`Running formula${formula.version.toLocaleUpperCase()} for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, formulaProps);

          const v1Result = (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental, item);
          const isArray = v1Result && Array.isArray(v1Result) && (v1Result as any).every((r: any) => typeof r === 'string');
          const resultIsPure = ['string', 'number', 'boolean'].includes(typeof v1Result) || v1Result instanceof Date|| isArray || !v1Result;
          if (resultIsPure) {
            if (formula.target === FormulaTargets.Value) {
              const valueV1: FormulaResultRaw = {
                value: FormulaValueCorrections.valueCorrection(v1Result as FieldValue, inputType),
                fields: [], stop: null, openInDesigner: isOpenInDesigner
              };
              this.designerSvc.cache.cacheResults(formula, valueV1.value, false, false);
              if (isOpenInDesigner)
                console.log('Formula result:', valueV1);
              return valueV1;
            }
            return {
              value: v1Result,
              fields: [],
              stop: null,
              openInDesigner: isOpenInDesigner
            } as FormulaResultRaw;
          }
          console.error('V1 formulas accept only simple values in return statements. If you need to return an complex object, use V2 formulas.');
          return {
            value: undefined,
            fields: [],
            stop: null,
            openInDesigner: isOpenInDesigner
          } satisfies FormulaResultRaw;

        case FormulaVersions.V2:
          if (isOpenInDesigner)
            console.log(`Running formula${formula.version.toLocaleUpperCase()} for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, formulaProps);

          //TODO: @2dm -> Added item as last argument so if ew use experimental anywhere nothing breaks
          const v2Result = (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental, item);

          const valueV2 = FormulaValueCorrections.correctAllValues(formula.target, v2Result, inputType);
          valueV2.openInDesigner = isOpenInDesigner;
          if (valueV2.value === undefined && valueV2.promise)
            this.designerSvc.cache.cacheResults(formula, undefined, false, true);
          else
            this.designerSvc.cache.cacheResults(formula, valueV2.value, false, false);
          if (isOpenInDesigner)
            console.log('Formula result:', valueV2.value);
          return valueV2;

        default:
          if (isOpenInDesigner)
            console.log(`Running formula for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}" with following arguments:`, undefined);
          const resultDef = (formula.fn as FormulaFunctionDefault)();
          const valueDef = FormulaValueCorrections.correctAllValues(formula.target, resultDef, inputType);
          valueDef.openInDesigner = isOpenInDesigner;
          this.designerSvc.cache.cacheResults(formula, valueDef.value, false, false);
          if (isOpenInDesigner)
            console.log('Formula result:', valueDef);
          return valueDef;
      }
    } catch (error) {
      const errorLabel = `Error in formula calculation for Entity: "${ctSettings._itemTitle}", Field: "${formula.fieldName}", Target: "${formula.target}"`;
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
  private isDesignerOpen(f: FormulaCacheItem): boolean {
    const ds = this.designerSvc.designerState();
    const isOpenInDesigner = ds.isOpen && ds.entityGuid === f.entityGuid && ds.fieldName === f.fieldName && ds.target === f.target;
    return isOpenInDesigner;
  }
}


export interface FormulaRunParameters {
  formula: FormulaCacheItem;
  formValues: FormValues;
  inputType: InputType;
  settingsInitial: FieldSettings;
  settingsCurrent: FieldSettings;
  itemIdWithPrefill: ItemIdentifierShared;
  item?: PickerItem;
}