import { FieldValue, FormValues } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';

export interface FormulaContext {
  data: FormulaCtxData;
}

export interface FormulaCtxData {
  name: string;
  value: FieldValue;
  form: FormValues;
}

export type FormulaFunction = (context: FormulaContext) => FieldValue;
