import { FieldValue } from '../../../../edit-types';
import { DesignerState, FormulaCacheItem, FormulaTarget } from '../../../shared/models';

export interface FormulaDesignerTemplateVars {
  entityOptions: EntityOption[];
  fieldOptions: FieldOption[];
  targetOptions: TargetOption[];
  formula: FormulaCacheItem;
  designer: DesignerState;
  snippets: DesignerSnippet[];
  result: FieldValue;
  resultIsError: boolean;
}

export interface SelectOptions {
  entityOptions: EntityOption[];
  fieldOptions: FieldOption[];
  targetOptions: TargetOption[];
}

export interface EntityOption {
  entityGuid: string;
  hasFormula: boolean;
  label: string;
}

export interface FieldOption {
  fieldName: string;
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
