export type FieldValue = string | boolean | number | string[];

export interface FormulaResultRaw {
  value: FieldValue;
  promise?: Promise<FieldValue>;
  additionalValues?: Record<string, FieldValue>;
}
