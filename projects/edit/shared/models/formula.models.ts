export type FormulaType = 'value' | 'visible' | 'required' | 'enabled';

export interface FieldFormulas {
  [fieldName: string]: string;
}

export interface CalcFields {
  [fieldName: string]: string[];
}

export interface LanguageChangeDisabledChecked {
  [fieldName: string]: boolean;
}
