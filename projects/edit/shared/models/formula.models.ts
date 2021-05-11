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

export interface FormulaErrorCounter {
  count: number;
  entityGuid: string;
  fieldName: string;
  type: FormulaType;
}

export type FormulaFunction = (context: FormulaContext) => FieldValue;

export const FormulaTypes = {
  Value: 'value',
  Visible: 'visible',
  Required: 'required',
  Enabled: 'enabled',
} as const;

export type FormulaType = typeof FormulaTypes[keyof typeof FormulaTypes];
