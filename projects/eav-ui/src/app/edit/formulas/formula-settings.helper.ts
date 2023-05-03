import { FieldSettings, FieldValue } from "projects/edit-types";
import { InputType } from "../../content-type-fields/models/input-type.model";
import { consoleLogAngular } from "../../shared/helpers/console-log-angular.helper";
import { LanguageState } from "../../shared/models/language-state";
import { FieldLogicBase } from "../form/shared/field-logic/field-logic-base";
import { FieldLogicTools } from "../form/shared/field-logic/field-logic-tools";
import { ValidationHelpers, FieldsSettingsHelpers } from "../shared/helpers";
import { EavContentTypeAttribute, EavEntity, EavValues } from "../shared/models/eav";
import { FormulaResultRaw, SettingsFormulaPrefix } from "./formula.models";

export class FormulaSettingsHelper {

  static ensureNewSettingsMatchRequirements(
    newSettings: FieldSettings,
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
    newSettings.Name = newSettings.Name || attribute.Name;
    newSettings.Required = ValidationHelpers.isRequired(newSettings);
    const disableTranslation = FieldsSettingsHelpers.findDisableTranslation(
      contentTypeMetadata, fieldInputType, attributeValues, languages.defaultLanguage, attribute.Metadata,
    );
    newSettings.DisableTranslation = slotIsEmpty || disableTranslation;
    newSettings._disabledBecauseOfTranslation = FieldsSettingsHelpers.getDisabledBecauseTranslations(
      attributeValues, newSettings.DisableTranslation, languages.currentLanguage, languages.defaultLanguage,
    );
    newSettings.Disabled = newSettings.Disabled || slotIsEmpty || newSettings._disabledBecauseOfTranslation || formReadOnly;
    newSettings.DisableAutoTranslation = newSettings.DisableAutoTranslation || newSettings.DisableTranslation;

    // update settings with respective FieldLogics
    const fixed = fieldLogic?.update(newSettings, valueBefore, logicTools) ?? newSettings;
    consoleLogAngular('fixed', JSON.parse(JSON.stringify(fixed)));

    return fixed;
  }

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