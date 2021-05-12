import { FieldValue } from '../../../edit-types';

export interface FormulaProps {
  data: FormulaData;
  context: FormulaContext;
}

export interface FormulaData {
  default: FieldValue;
  value: FieldValue;
  [fieldName: string]: FieldValue;
}

export interface FormulaContext {
  culture: FormulaCtxCulture;
  target: FormulaCtxTarget;
}

export interface FormulaCtxCulture {
  code: string;
  name: string;
}

export interface FormulaCtxTarget {
  default: FieldValue;
  name: string;
  type: string;
  value: FieldValue;
}

export interface FormulaErrorCounter {
  count: number;
  entityGuid: string;
  fieldName: string;
  type: FormulaType;
}

export type FormulaFunction = (data: FormulaData, context: FormulaContext) => FieldValue;

export const FormulaTypes = {
  Disabled: 'Field.Settings.Disabled',
  Required: 'Field.Settings.Required',
  Value: 'Field.Value',
  Visible: 'Field.Settings.VisibleInEditUI',
} as const;

export type FormulaType = typeof FormulaTypes[keyof typeof FormulaTypes];

export interface CustomFormula {
  entityGuid: string;
  fieldName: string;
  type: FormulaType;
  formula: string;
}

export interface CustomFormulaResult {
  entityGuid: string;
  fieldName: string;
  type: FormulaType;
  value: FieldValue;
  isError: boolean;
}
