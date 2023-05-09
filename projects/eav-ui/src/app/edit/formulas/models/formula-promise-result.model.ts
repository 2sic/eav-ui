import { FormValues } from "../../shared/models";
import { FieldValuePair, FieldSettingPair } from "./formula-results.models";

export class FormulaPromiseResult {
  constructor(
    valueUpdates: FormValues,
    fieldUpdates: FieldValuePair[],
    settingUpdates: FieldSettingPair[]
  ) {
    this.valueUpdates = valueUpdates;
    this.fieldUpdates = fieldUpdates;
    this.settingUpdates = settingUpdates;
  }

  valueUpdates: FormValues;
  fieldUpdates: FieldValuePair[];
  settingUpdates: FieldSettingPair[];
}
