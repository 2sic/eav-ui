import { Of } from '../../../../core';
import { FormulaCacheItem } from '../../../formulas/cache/formula-cache.model';
import { FormulaTargets } from '../../../formulas/targets/formula-targets';

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
  target: Of<typeof FormulaTargets>;
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
