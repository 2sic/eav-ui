import { FieldValue, FormValues } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';

export interface FormulaContext {
  data: FormulaCtxData;
}

export interface FormulaCtxData {
  name: string;
  value: FieldValue;
  form: FormValues;
}

export type FormulaFunction = (context: FormulaContext) => FieldValue;

export type FormulaType = 'value' | 'visible' | 'required' | 'enabled';

export interface FieldFormulas {
  [fieldName: string]: FormulaFunction;
}

export interface CalcFields {
  [fieldName: string]: string[];
}

export interface LanguageChangeCheckedFields {
  [fieldName: string]: boolean;
}

export interface FieldsFormulaSettings {
  [fieldName: string]: FormulaFieldSettings;
}

export interface FormulaFieldSettings {
  hidden: boolean;
  required: boolean;
  disabled: boolean;
}
