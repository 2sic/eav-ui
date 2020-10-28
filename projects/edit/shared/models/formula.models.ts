export type FormulaType = 'value';

export interface FieldFormulas {
  [fieldName: string]: string;
}

export interface CalcFields {
  [fieldName: string]: string[];
}

export interface LanguageChangeDisabledChecked {
  [fieldName: string]: boolean;
}
