import { FormulaFunction } from '../store/ngrx-data/item.models';

export type FormulaType = 'value' | 'visible' | 'required' | 'enabled';

export interface FieldFormulas {
  [fieldName: string]: FormulaFunction;
}

export interface CalcFields {
  [fieldName: string]: string[];
}

export interface LanguageChangeDisabledChecked {
  [fieldName: string]: boolean;
}
