import { FormulaTarget } from '../../../formulas/targets/formula-targets';
import { FormulaCacheItem } from '../../../formulas/cache/formula-cache.model';

export interface EntityOption {
  entityGuid: string;
  formulas: FormulaCacheItem[];
  hasFormula: boolean;
  label: string;
}

export interface FieldOption {
  fieldName: string;
  formulas: FormulaCacheItem[];
  hasFormula: boolean;
  inputType: string;
  label: string;
}

export interface TargetOption {
  hasFormula: boolean;
  label: string;
  target: FormulaTarget;
}

export interface DesignerSnippet {
  code: string;
  label: string;
}

export const SelectTargets = {
  Entity: 'entityGuid',
  Field: 'fieldValue',
  Target: 'formulaTarget',
} as const /* the as const ensures that the keys/values can be strictly checked */;

export type SelectTarget = typeof SelectTargets[keyof typeof SelectTargets];
