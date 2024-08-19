import { ItemValuesOfOneLanguage } from "../../shared/models";
import { FieldValuePair, FieldSettingPair } from "./formula-results.models";

export class FormulaPromiseResult {
  constructor(
    valueUpdates: ItemValuesOfOneLanguage,
    fieldUpdates: FieldValuePair[],
    settingUpdates: FieldSettingPair[]
  ) {
    this.valueUpdates = valueUpdates;
    this.fieldUpdates = fieldUpdates;
    this.settingUpdates = settingUpdates;
  }

  valueUpdates: ItemValuesOfOneLanguage;
  fieldUpdates: FieldValuePair[];
  settingUpdates: FieldSettingPair[];
}
