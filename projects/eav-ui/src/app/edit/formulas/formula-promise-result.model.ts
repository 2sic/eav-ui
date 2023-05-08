import { FormValues } from "../shared/models";
import { FieldValuePair, FieldSettingPair } from "./formula.models";

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

export interface FormulaPromiseResult {
  valueUpdates: FormValues,
  fieldUpdates: FieldValuePair[],
  settingUpdates: FieldSettingPair[]
}