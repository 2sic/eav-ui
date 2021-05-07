import { FieldValue } from '../../../edit-types';

export interface FormulaContext {
  culture: FormulaCtxCulture;
  entity: FormulaCtxEntity;
  field: FormulaCtxField;
  fields: Record<string, FormulaCtxField>;
  value: FormulaCtxValue;
}

export interface FormulaCtxCulture {
  code: string;
  name: string;
}

export interface FormulaCtxEntity {
  guid: string;
  id: number;
}

export interface FormulaCtxField {
  name: string;
  type: string;
  value: FieldValue;
}

export interface FormulaCtxValue {
  current: FieldValue;
  default: FieldValue;
  // initial: FieldValue;
}

export type FormulaFunction = (context: FormulaContext) => FieldValue;

export type FormulaType = 'value' | 'visible' | 'required' | 'enabled';
