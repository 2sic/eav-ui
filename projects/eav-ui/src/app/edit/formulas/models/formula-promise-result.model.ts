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

// TODO: @SDV YOU SHOULD never make an interface which matches a class, because you should then use the class...
export interface FormulaPromiseResult {
  valueUpdates: FormValues,
  fieldUpdates: FieldValuePair[],
  settingUpdates: FieldSettingPair[]
}