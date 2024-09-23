import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { FormulaFieldValidation } from '../targets/formula-targets';


export interface FormulaV1Data {
  default: FieldValue;
  initial: FieldValue;
  parameters: Record<string, any>;
  prefill: FieldValue;
  value: FieldValue | FormulaFieldValidation;
  [fieldName: string]: any;
}
