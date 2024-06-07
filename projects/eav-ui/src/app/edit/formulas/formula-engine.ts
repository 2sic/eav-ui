import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FieldSettings, FieldValue, PickerItem } from 'projects/edit-types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { InputType } from '../../content-type-fields/models/input-type.model';
import { FeatureSummary } from '../../features/models';
import { FeaturesService } from '../../shared/services/features.service';
import { EntityReader } from '../shared/helpers';
import { ContentTypeSettings, FormValues, LogSeverities } from '../shared/models';
import { EavContentTypeAttribute, EavEntity, EavValues } from '../shared/models/eav';
import { FormConfigService, EditInitializerService, FieldsSettingsService, LoggingService } from '../shared/services';
import { GlobalConfigService, ItemService, LanguageInstanceService, LanguageService } from '../shared/store/ngrx-data';
import { FormulaDesignerService } from './formula-designer.service';
import { FormulaHelpers } from './helpers/formula.helpers';
// tslint:disable-next-line: max-line-length
import { FormulaCacheItem, FormulaFieldValidation, FormulaFunctionDefault, FormulaFunctionV1, FormulaListItemTargets, FormulaDefaultTargets, FormulaTarget, FormulaTargets, FormulaVersions, FormulaOptionalTargets } from './models/formula.models';
import { FormulaSettingsHelper } from './helpers/formula-settings.helper';
import { FieldLogicBase } from '../form/shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../form/shared/field-logic/field-logic-tools';
import { FormulaValueCorrections } from './helpers/formula-value-corrections.helper';
import { FormulaPromiseHandler } from './formula-promise-handler';
import { RunFormulasResult, FormulaResultRaw, FieldValuePair } from './models/formula-results.models';
import { ItemIdentifierShared } from '../../shared/models/edit-form.model';
import { Title } from '@angular/platform-browser';

/**
 * Formula engine is responsible for running formulas and returning the result.
 */
@Injectable()
export class FormulaEngine implements OnDestroy {
  private subscription: Subscription = new Subscription();
  private featuresCache$ = new BehaviorSubject<FeatureSummary[]>([]);
  private contentTypeSettings$: BehaviorSubject<ContentTypeSettings>;
  private fieldsSettingsService: FieldsSettingsService = null;
  private formulaPromiseHandler: FormulaPromiseHandler = null;

  constructor(
    private languageStore: LanguageInstanceService,
    private formConfig: FormConfigService,
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
    formulaPromiseHandler: FormulaPromiseHandler,
    contentTypeSettings$: BehaviorSubject<ContentTypeSettings>) {
    this.fieldsSettingsService = fieldsSettingsService;
    this.formulaPromiseHandler = formulaPromiseHandler;
    this.contentTypeSettings$ = contentTypeSettings$;
    this.subscription.add(this.featuresService.getAll$().subscribe(this.featuresCache$));
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
    entityId: number,
    attribute: EavContentTypeAttribute,
    formValues: FormValues,
    inputType: InputType,
    settingsInitial: FieldSettings,
    settingsCurrent: FieldSettings,
    itemIdWithPrefill: ItemIdentifierShared,
    availableItems: PickerItem[],
  ): PickerItem[] {
    const formulas = this.formulaDesignerService.getFormulas(entityGuid, attribute.Name, Object.values(FormulaListItemTargets), false)
      .filter(f => !f.stopFormula);
    if (formulas.length === 0) { return availableItems; }
    for (const formula of formulas) {
      for (const item of availableItems) {
        const formulaResult = this.runFormula(formula, entityId, formValues, inputType, settingsInitial, settingsCurrent, itemIdWithPrefill, item);

        switch (formula.target) {
          case FormulaTargets.ListItemLabel:
            item.label = formulaResult.value as string;
            break;
          case FormulaTargets.ListItemDisabled:
            item.notSelectable = formulaResult.value as boolean;
            break;
          case FormulaTargets.ListItemTooltip:
            item.tooltip = formulaResult.value as string;
            break;
          case FormulaTargets.ListItemInformation:
            item.infoBox = formulaResult.value as string;
            break;
          case FormulaTargets.ListItemHelpLink:
            item.helpLink = formulaResult.value as string;
            break;
        }
      }
    }
    return availableItems;
  }

  /**
   * Used for running all formulas for a given attribute/field.
   * @param entityGuid 
   * @param entityId 
   * @param attribute 
   * @param formValues 
   * @param inputType 
   * @param logic 
   * @param settingsInitial 
   * @param settingsCurrent 
   * @param itemIdWithPrefill 
   * @param contentTypeMetadata 
   * @param attributeValues 
   * @param entityReader 
   * @param slotIsEmpty 
   * @param formReadOnly 
   * @param valueBefore 
   * @param logicTools 
   * @returns Object with all changes that formulas should make
   */
  runAllFormulas(
    entityGuid: string,
    entityId: number,
    attribute: EavContentTypeAttribute,
    formValues: FormValues,
    inputType: InputType,
    logic: FieldLogicBase,
    settingsInitial: FieldSettings,
    settingsCurrent: FieldSettings,
    itemIdWithPrefill: ItemIdentifierShared,
    contentTypeMetadata: EavEntity[],
    attributeValues: EavValues<any>,
    entityReader: EntityReader,
    slotIsEmpty: boolean,
    formReadOnly: boolean,
    valueBefore: FieldValue,
    logicTools: FieldLogicTools,
  ): RunFormulasResult {
    //TODO: @2dm -> Here for target I send all targets except listItem targets, used to be "null" before
    const formulas = this.formulaDesignerService.getFormulas(entityGuid, attribute.Name, Object.values(FormulaDefaultTargets).concat(Object.values(FormulaOptionalTargets)), false)
      .filter(f => !f.stopFormula);
    let formulaValue: FieldValue;
    let formulaValidation: FormulaFieldValidation;
    const formulaFields: FieldValuePair[] = [];
    const settingsNew: Record<string, any> = {};

    for (const formula of formulas) {
      const formulaResult = this.runFormula(formula, entityId, formValues, inputType, settingsInitial, settingsCurrent, itemIdWithPrefill);
      if (formulaResult?.promise instanceof Promise) {
        this.formulaPromiseHandler.handleFormulaPromise(entityGuid, formulaResult, formula, inputType);
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

  /**
   * Used for getting formula setting key.
   * @param fieldName 
   * @param currentLanguage 
   * @param defaultLanguage 
   * @returns formula setting key
   */
  private getFormulaSettingsKey(fieldName: string, currentLanguage: string, defaultLanguage: string): string {
    return `fieldName:${fieldName}:currentLanguage:${currentLanguage}:defaultLanguage:${defaultLanguage}`;
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
  private runFormula(
    formula: FormulaCacheItem,
    entityId: number,
    formValues: FormValues,
    inputType: InputType,
    settingsInitial: FieldSettings,
    settingsCurrent: FieldSettings,
    itemIdWithPrefill: ItemIdentifierShared,
    item?: PickerItem
  ): FormulaResultRaw {
    const currentLanguage = this.languageStore.getCurrent(this.formConfig.config.formId);
    const defaultLanguage = this.languageStore.getPrimary(this.formConfig.config.formId);
    const languages = this.languageService.getLanguages();
    const debugEnabled = this.globalConfigService.getDebugEnabled();
    const initialFormValues = this.editInitializerService.getInitialValues(formula.entityGuid, currentLanguage);
    const formulaProps = FormulaHelpers.buildFormulaProps(
      formula,
      entityId,
      inputType?.Type,
      settingsInitial,
      settingsCurrent,
      formValues,
      initialFormValues,
      currentLanguage,
      defaultLanguage,
      languages,
      itemIdWithPrefill,
      debugEnabled,
      this.itemService,
      this.formConfig,
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
          const formulaV1Result = (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental, item);//TODO: @2dm -> Should I even pass item here? as this is for V1 formulas
          const isArray = formulaV1Result && Array.isArray(formulaV1Result) && (formulaV1Result as any).every((r: any) => typeof r === 'string');
          if (typeof formulaV1Result === 'string'
            || typeof formulaV1Result === 'number'
            || typeof formulaV1Result === 'boolean'
            || formulaV1Result instanceof Date
            || isArray
            || !formulaV1Result) {
            if (formula.target === FormulaTargets.Value) {
              const valueV1 = {
                value: FormulaValueCorrections.valueCorrection(formulaV1Result as FieldValue, inputType),
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
          const formulaV2Result = (formula.fn as FormulaFunctionV1)(formulaProps.data, formulaProps.context, formulaProps.experimental, item); //TODO: @2dm -> Added item as last argument so if ew use experimental anywhere nothing breaks
          const valueV2 = FormulaValueCorrections.correctAllValues(formula.target, formulaV2Result, inputType);
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
          const valueDefault = FormulaValueCorrections.correctAllValues(formula.target, formulaDefaultResult, inputType);
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

  /**
   * Used for checking if formula is open in designer.
   * @param formula 
   * @returns True if formula is open in designer, otherwise false
   */
  private isDesignerOpen(formula: FormulaCacheItem): boolean {
    const designerState = this.formulaDesignerService.getDesignerState();
    const isOpenInDesigner = designerState.isOpen
      && designerState.entityGuid === formula.entityGuid
      && designerState.fieldName === formula.fieldName
      && designerState.target === formula.target;
    return isOpenInDesigner;
  }
}
