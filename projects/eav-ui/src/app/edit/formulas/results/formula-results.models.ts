import { FieldSettings, FieldValue } from "projects/edit-types";
import { FormulaFieldValidation, FormulaTarget } from '../targets/formula-targets';

export interface RunFormulasResult {
  settings: FieldSettings;
  validation: FormulaFieldValidation;
  value: FieldValue;
  fields: FieldValuePair[];
}

export interface FormulaIdentifier {
  /** The entity it's for */
  entityGuid: string;
  /** The field it's for */
  fieldName: string;
  /** ?? */
  target: FormulaTarget;
}

export interface FormulaResultRaw {
  value?: FieldValue;
  promise?: Promise<FormulaResultRaw>;
  fields?: FieldValuePair[];
  stop?: boolean | null;

  /** Note: not a real result, for internal use only */
  openInDesigner?: boolean;
}

export interface FieldValuePair {
  name: string;
  value: FieldValue;
}


