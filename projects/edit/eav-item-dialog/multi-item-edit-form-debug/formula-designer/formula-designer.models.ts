import { FieldValue } from '../../../../edit-types';
import { ActiveDesigner, FormulaCacheItem } from '../../../shared/models';

export interface FormulaDesignerTemplateVars {
  editMode: boolean;
  formula: FormulaCacheItem;
  hasFormula: HasFormula;
  selected: ActiveDesigner;
  snippets: DesignerSnippet[];
  result: FieldValue;
}

export interface HasFormula {
  [entityGuid: string]: {
    [fieldName: string]: {
      [target: string]: boolean;
    };
  };
}

export interface EntityOption {
  entityGuid: string;
  label: string;
}

export interface FieldOption {
  fieldName: string;
  label: string;
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
