export type FieldValue = string | boolean | number | string[];

export interface FormulaResultRaw {
  value?: FieldValue;
  promise?: Promise<FieldValue>;
  additionalValues?: FieldValuePair[];
  openInDesigner?: boolean;
  stopFormula?: boolean | null;
}

export interface FieldValuePair {
  field: string;
  value: FieldValue;
}
