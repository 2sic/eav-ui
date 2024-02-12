import { FieldSettings, FieldValue } from "projects/edit-types";
import { InputType } from "../../../content-type-fields/models/input-type.model";
import { LanguageState } from "../../../shared/models/language-state";
import { FieldLogicBase } from "../../form/shared/field-logic/field-logic-base";
import { FieldLogicTools } from "../../form/shared/field-logic/field-logic-tools";
import { ValidationHelpers, FieldsSettingsHelpers } from "../../shared/helpers";
import { EavContentTypeAttribute, EavEntity, EavValues } from "../../shared/models/eav";
import { SettingsFormulaPrefix } from "../models/formula.models";

/**
 * Contains methods for updating settings from formulas.
 */
export class FormulaSettingsHelper {

  /**
   * Used for calculating new settings.
   * @param settingsInitial Default settings
   * @param settingsCurrent Last settings
   * @param attribute 
   * @param contentTypeMetadata 
   * @param fieldInputType 
   * @param fieldLogic 
   * @param attributeValues 
   * @param languages 
   * @param slotIsEmpty If slot is empty
   * @param formReadOnly Is form read only
   * @param valueBefore 
   * @param logicTools 
   * @returns Calculated settings
   */
  static ensureNewSettingsMatchRequirements(
    settingsInitial: FieldSettings,
    settingsCurrent: FieldSettings,
    attribute: EavContentTypeAttribute,
    contentTypeMetadata: EavEntity[],
    fieldInputType: InputType,
    fieldLogic: FieldLogicBase,
    attributeValues: EavValues<any>,
    languages: LanguageState,
    slotIsEmpty: boolean,
    formReadOnly: boolean,
    valueBefore: FieldValue,
    logicTools: FieldLogicTools,
  ): FieldSettings {
    settingsCurrent.Name = settingsCurrent.Name || attribute.Name;
    settingsCurrent.Required = ValidationHelpers.isRequired(settingsCurrent);
    const disableTranslation = FieldsSettingsHelpers.findDisableTranslation(
      contentTypeMetadata, fieldInputType, attributeValues, languages.defaultLanguage, attribute.Metadata,
    );
    settingsCurrent.DisableTranslation = slotIsEmpty || disableTranslation;
    settingsCurrent._disabledBecauseOfTranslation = FieldsSettingsHelpers.getDisabledBecauseTranslations(
      attributeValues, settingsCurrent.DisableTranslation, languages.currentLanguage, languages.defaultLanguage,
    );
    settingsCurrent.ForcedDisabled = slotIsEmpty || settingsCurrent._disabledBecauseOfTranslation || formReadOnly;
    // newSettings.Disabled = newSettings.Disabled || slotIsEmpty || newSettings._disabledBecauseOfTranslation || formReadOnly;
    settingsCurrent.DisableAutoTranslation = settingsInitial.DisableAutoTranslation || settingsCurrent.DisableTranslation;

    // update settings with respective FieldLogics
    const fixed = fieldLogic?.update(settingsCurrent, valueBefore, logicTools) ?? settingsCurrent;
    // consoleLogForm('fixed', JSON.parse(JSON.stringify(fixed)));

    return fixed;
  }

  /**
   * Possibly updates setting with formula result if target and type matches.
   * @param target Formula target
   * @param settings Last/Current settings
   * @param formulaResult Formula result needed for type checking
   * @param settingsNew Settings that are possibly updated
   * @returns True if setting is updated, false if it is not
   */
  static keepSettingsIfTypeMatches(
    target: string,
    settings: FieldSettings,
    formulaResult: FieldValue,
    settingsNew: Record<string, any>
  ): boolean {
    if (target.startsWith(SettingsFormulaPrefix)) {
      const settingName = target.substring(SettingsFormulaPrefix.length);
      const prevSetting = (settings as Record<string, any>)[settingName];

      const keepNewSetting = (prevSetting == null || formulaResult == null) // can't check types, hope for the best
        || (Array.isArray(prevSetting) && Array.isArray(formulaResult)) // can't check types of items in array, hope for the best
        || (typeof prevSetting === typeof formulaResult); // maybe typesafe

      if (keepNewSetting) {
        settingsNew[settingName] = formulaResult;
        return true;
      }
    }
    return false;
  }
}