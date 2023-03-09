import { FieldValue } from "projects/edit-types";

export interface FormulaResultRaw {
  value?: FieldValue;
  promise?: Promise<FormulaResultRaw>;
  fields?: FieldValuePair[];
  openInDesigner?: boolean;
  stop?: boolean | null;
}

export interface FieldValuePair {
  field: string;
  value: FieldValue;
}
