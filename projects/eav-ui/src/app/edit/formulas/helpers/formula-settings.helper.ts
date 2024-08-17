import { FieldSettings, FieldValue } from "projects/edit-types";
import { InputType } from "../../../content-type-fields/models/input-type.model";
import { FieldLogicBase } from "../../form/shared/field-logic/field-logic-base";
import { FieldLogicTools } from "../../form/shared/field-logic/field-logic-tools";
import { ValidationHelpers, FieldsSettingsHelpers, FieldSettingsDisabledBecauseOfLanguageHelper } from "../../shared/helpers";
import { EavContentTypeAttribute, EavEntity, EavField } from "../../shared/models/eav";
import { SettingsFormulaPrefix } from "../models/formula.models";
import { FormLanguage } from '../../shared/models/form-languages.model';

/**
 * Contains methods for updating settings from formulas.
 */
export class FormulaSettingsHelper {

  // /**
  //  * Used for calculating new settings.
  //  * @param settingsInitial Default settings
  //  * @param settingsNew Last settings
  //  * @param attribute
  //  * @param contentTypeMetadata
  //  * @param fieldInputType
  //  * @param fieldLogic
  //  * @param attributeValues
  //  * @param language
  //  * @param slotIsEmpty If slot is empty
  //  * @param formReadOnly Is form read only
  //  * @param valueBefore
  //  * @param logicTools
  //  * @returns Calculated settings
  //  */
  // static ensureNewSettingsMatchRequirements(
  //   settingsInitial: FieldSettings,
  //   settingsNew: FieldSettings,
  //   attribute: EavContentTypeAttribute,
  //   // contentTypeMetadata: EavEntity[],
  //   // fieldInputType: InputType,
  //   fieldLogic: FieldLogicBase,
  //   // attributeValues: EavField<any>,
  //   // language: FormLanguage,
  //   slotIsEmpty: boolean,
  //   formReadOnly: boolean,
  //   valueBefore: FieldValue,
  //   logicTools: FieldLogicTools,
  //   disabledHelper: FieldSettingsDisabledBecauseOfLanguageHelper,
  // ): FieldSettings {
  //   settingsNew.Name = settingsNew.Name || attribute.Name;
  //   settingsNew._currentRequired = ValidationHelpers.isRequired(settingsNew);
  //   const disableTranslation = disabledHelper.findDisableTranslation();
  //   //  FieldsSettingsHelpers.findDisableTranslation(
  //   //   contentTypeMetadata,
  //   //   fieldInputType,
  //   //   attributeValues,
  //   //   language.primary,
  //   //   attribute.Metadata,
  //   // );
  //   settingsNew.DisableTranslation = slotIsEmpty || disableTranslation;
  //   settingsNew._disabledBecauseOfTranslation = disabledHelper.getDisabledBecauseTranslations(settingsNew.DisableTranslation);
  //   //  FieldsSettingsHelpers.getDisabledBecauseTranslations(
  //   //   attributeValues,
  //   //   settingsNew.DisableTranslation,
  //   //   language,
  //   // );
  //   settingsNew.ForcedDisabled = slotIsEmpty || settingsNew._disabledBecauseOfTranslation || formReadOnly;

  //   settingsNew.DisableAutoTranslation = settingsInitial.DisableAutoTranslation || settingsNew.DisableTranslation;

  //   // update settings with respective FieldLogics
  //   const fixed = fieldLogic?.update(settingsNew, valueBefore, logicTools) ?? settingsNew;

  //   return fixed;
  // }

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
    if (!target.startsWith(SettingsFormulaPrefix))
      return false;

    const settingName = target.substring(SettingsFormulaPrefix.length);
    const prevSetting = (settings as Record<string, any>)[settingName];

    const keepNewSetting = (prevSetting == null || formulaResult == null) // can't check types, hope for the best
      || (Array.isArray(prevSetting) && Array.isArray(formulaResult)) // can't check types of items in array, hope for the best
      || (typeof prevSetting === typeof formulaResult); // maybe typesafe

    if (!keepNewSetting)
      return false;

    settingsNew[settingName] = formulaResult;
    return true;
  }
}
