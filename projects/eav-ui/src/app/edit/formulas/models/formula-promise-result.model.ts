import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { FieldValuePair, FieldSettingPair } from "./formula-results.models";

export class FormulaPromiseResult {
  constructor(
    valueUpdates: ItemValuesOfLanguage,
    fieldUpdates: FieldValuePair[],
    settingUpdates: FieldSettingPair[]
  ) {
    this.valueUpdates = valueUpdates;
    this.fieldUpdates = fieldUpdates;
    this.settingUpdates = settingUpdates;
  }

  valueUpdates: ItemValuesOfLanguage;
  fieldUpdates: FieldValuePair[];
  settingUpdates: FieldSettingPair[];
}
