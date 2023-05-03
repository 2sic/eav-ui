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