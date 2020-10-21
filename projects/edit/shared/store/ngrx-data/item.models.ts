import { EavAttributes } from '../../models/eav';

export interface FieldFormulas {
  [fieldName: string]: string;
}

export interface FormulaContext {
  fieldName: string;
  fieldValue: string;
  allValues: EavAttributes;
}
