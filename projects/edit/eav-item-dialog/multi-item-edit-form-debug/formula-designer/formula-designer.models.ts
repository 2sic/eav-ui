import { FieldValue } from '../../../../edit-types';
import { DesignerState, FormulaCacheItem, FormulaTarget } from '../../../shared/models';

export interface FormulaDesignerTemplateVars {
  entityOptions: EntityOption[];
  fieldOptions: FieldOptions;
  targetOptions: TargetOptions;
  formula: FormulaCacheItem;
  designer: DesignerState;
  snippets: DesignerSnippet[];
  result: FieldValue;
  resultIsError: boolean;
}

export interface EntityOption {
  entityGuid: string;
  hasFormula: boolean;
  label: string;
}

export interface FieldOptions {
  [entityGuid: string]: FieldOption[];
}

export interface FieldOption {
  fieldName: string;
  hasFormula: boolean;
  label: string;
}

export interface TargetOptions {
  [entityGuid: string]: {
    [fieldName: string]: TargetOption[];
  };
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
