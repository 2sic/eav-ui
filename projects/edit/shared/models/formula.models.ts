import { FieldSettings, FieldValue } from '../../../edit-types';

export interface FormulaCacheItem {
  cache: Record<string, any>;
  entityGuid: string;
  fieldName: string;
  /** Function built when formula is saved */
  fn: FormulaFunction;
  /** Is formula currently being edited (not yet saved) */
  isDraft: boolean;
  /** Current formula string */
  source: string;
  /** Formula string in field settings */
  sourceFromSettings: string;
  target: FormulaTarget;
  version: FormulaVersion;
}

export type FormulaFunction = FormulaFunctionDefault | FormulaFunctionV1;

export type FormulaFunctionDefault = () => FieldValue;

export type FormulaFunctionV1 = (data: FormulaV1Data, context: FormulaV1Context) => FieldValue;

export const FormulaVersions = {
  V1: 'v1',
} as const;

export type FormulaVersion = typeof FormulaVersions[keyof typeof FormulaVersions];

export const FormulaTargets = {
  Disabled: 'Field.Settings.Disabled',
  Required: 'Field.Settings.Required',
  Value: 'Field.Value',
  Visible: 'Field.Settings.VisibleInEditUI',
} as const;

export const SettingsFormulaPrefix = FormulaTargets.Disabled.substring(0, FormulaTargets.Disabled.lastIndexOf('.') + 1);

export type FormulaTarget = typeof FormulaTargets[keyof typeof FormulaTargets];

export type FormulaProps = FormulaPropsV1;

export interface FormulaPropsV1 {
  data: FormulaV1Data;
  context: FormulaV1Context;
}

export interface FormulaV1Data {
  default: FieldValue;
  value: FieldValue;
  [fieldName: string]: FieldValue;
}

export interface FormulaV1Context {
  culture: FormulaV1CtxCulture;
  target: FormulaV1CtxTarget;
}

export interface FormulaV1CtxCulture {
  code: string;
  name: string;
}

export interface FormulaV1CtxTarget {
  entity: FormulaV1CtxTargetEntity;
  name: string;
  type: string;
}

export interface FormulaV1CtxTargetEntity {
  guid: string;
  id: number;
}

export interface RunFormulasResult {
  settings: FieldSettings;
  value: FieldValue;
}

export interface FormulaResult {
  entityGuid: string;
  fieldName: string;
  target: FormulaTarget;
  value: FieldValue;
  isError: boolean;
}

export interface DesignerState {
  editMode: boolean;
  entityGuid: string;
  fieldName: string;
  isOpen: boolean;
  target: FormulaTarget;
}
