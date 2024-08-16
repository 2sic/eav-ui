import { DesignerState } from '../../../formulas/models/formula-results.models';
import { FormulaCacheItem, FormulaTarget } from '../../../formulas/models/formula.models';

export interface FormulaDesignerViewModel {
  formula: FormulaCacheItem;
  designer: DesignerState;
  dataSnippets: DesignerSnippet[];
  typings: string;
  template: string;
}

export interface SelectOptions {
  fieldOptions: FieldOption[];
  // targetOptions: TargetOption[];
}

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
} as const;

export type SelectTarget = typeof SelectTargets[keyof typeof SelectTargets];
