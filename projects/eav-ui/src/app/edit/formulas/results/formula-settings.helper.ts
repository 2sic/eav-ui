import { SettingsFormulaPrefix } from '../targets/formula-targets';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import isEqual from 'lodash-es/isEqual';

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
    valueNew: any,
    settingsNew: Partial<FieldSettings>,
  ): Partial<FieldSettings> {
    return FormulaSettingsHelper.keepSettingIfTypeOkAndStatus(target, settings, valueNew, settingsNew).settingsNew;
  }

  static keepSettingIfTypeOkAndStatus(
    target: string,
    settings: FieldSettings,
    valueNew: any,
    settingsNew: Partial<FieldSettings>,
  ): { settingsNew: Partial<FieldSettings>, wasChanged: boolean } {
    // Retrieve the previous setting
    const settingName = target.substring(SettingsFormulaPrefix.length) as keyof FieldSettings;
    const prevSetting = settings[settingName];

    if (isEqual(prevSetting, valueNew))
      return { settingsNew, wasChanged: false };

    const keepNewSetting = (Array.isArray(prevSetting) && Array.isArray(valueNew)) // can't check types of items in array, hope for the best
      || (typeof prevSetting === typeof valueNew); // maybe typesafe

    if (!keepNewSetting)
      return { settingsNew, wasChanged: false };

    (settingsNew as Record<keyof FieldSettings, any>)[settingName] = valueNew;
    return { settingsNew, wasChanged: true };
  }
}
