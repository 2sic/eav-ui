import { FieldSettings, FieldValue } from "projects/edit-types";
import { FormulaFieldValidation, FormulaTarget } from "./formula.models";

export interface RunFormulasResult {
  settings: FieldSettings;
  validation: FormulaFieldValidation;
  value: FieldValue;
  fields: FieldValuePair[];
}

export interface FormulaIdentifier {
  entityGuid: string;
  fieldName: string;
  target: FormulaTarget;
}

export interface FormulaResult extends FormulaIdentifier {
  value: FieldValue;
  isError: boolean;
  isOnlyPromise: boolean;
}

export interface DesignerState extends FormulaIdentifier {
  editMode: boolean;
  isOpen: boolean;
}

export interface FormulaResultRaw {
  value?: FieldValue;
  promise?: Promise<FormulaResultRaw>;
  fields?: FieldValuePair[];
  stop?: boolean | null;

  /** Note: not a real result, for internal use only */
  openInDesigner?: boolean;
}

export interface FieldValuePair {
  name: string;
  value: FieldValue;
}

export interface FieldSettingPair {
  name: string;
  settings: SettingPair[];
}

export interface SettingPair {
  settingName: string;
  value: FieldValue;
}
