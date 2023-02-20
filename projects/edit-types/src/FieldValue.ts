export type FieldValue = string | boolean | number | string[];

export interface FormulaResultRaw {
  value: FieldValue;
  promise?: Promise<FieldValue>;
  additionalValues?: FieldValuePair[];
}

export interface FieldValuePair {
  field: string;
  value: FieldValue;
}
