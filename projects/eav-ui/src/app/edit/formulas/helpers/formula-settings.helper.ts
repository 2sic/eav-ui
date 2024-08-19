import { FieldSettings, FieldValue } from "projects/edit-types";
import { SettingsFormulaPrefix } from "../models/formula.models";

/**
 * Contains methods for updating settings from formulas.
 */
export class FormulaSettingsHelper {

  /**
   * Possibly updates setting with formula result if target and type matches.
   * @param target Formula target
   * @param settings Last/Current settings
   * @param valueNew Formula result needed for type checking
   * @param settingsNew Settings that are possibly updated
   * @returns True if setting is updated, false if it is not
   */
  static keepSettingIfTypeOk(
    target: string,
    settings: FieldSettings,
    valueNew: FieldValue,
    settingsNew: Record<string, any>
  ): { settingsNew: Record<string, any>, wasChanged: boolean } {
    
    // If the formula changed a value (not a setting), exit early
    if (!target.startsWith(SettingsFormulaPrefix))
      return { settingsNew, wasChanged: false };

    // Retrieve the previous setting
    const settingName = target.substring(SettingsFormulaPrefix.length);
    const prevSetting = (settings as Record<string, any>)[settingName];

    const keepNewSetting = (prevSetting == null || valueNew == null) // can't check types, hope for the best
      || (Array.isArray(prevSetting) && Array.isArray(valueNew)) // can't check types of items in array, hope for the best
      || (typeof prevSetting === typeof valueNew); // maybe typesafe

    if (!keepNewSetting)
      return { settingsNew, wasChanged: false };

    settingsNew[settingName] = valueNew;
    return { settingsNew, wasChanged: true };
  }
}
