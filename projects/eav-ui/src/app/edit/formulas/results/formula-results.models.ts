import { FormulaFieldValidation, FormulaTarget } from '../targets/formula-targets';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { PickerItem } from 'projects/edit-types';

export interface RunFormulasResult {
  settings: FieldSettings;
  validation: FormulaFieldValidation;
  value: FieldValue;
  fields: FieldValuePair[];
  pickers: PickerItem[];
  pickerVersion: number | null;
}

export interface FormulaIdentifier {
  /** The entity it's for */
  entityGuid: string;
  /** The field it's for */
  fieldName: string;
  /** ?? */
  target: FormulaTarget;
}

export interface FormulaResultRaw {
  value?: FieldValue;
  promise?: Promise<FormulaResultRaw>;
  fields?: FieldValuePair[];
  stop?: boolean | null;

  /** WIP v18 */
  options?: PickerItem[];

  /** WIP v18 */
  wait?: boolean;

  /** Note: not a real result, for internal use only */
  openInDesigner?: boolean;
}

export interface FieldValuePair {
  name: string;
  value: FieldValue;
}


