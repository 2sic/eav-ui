export interface FormValues {
  [fieldName: string]: FieldValue;
}

export type FieldValue = string | boolean | number | string[];
