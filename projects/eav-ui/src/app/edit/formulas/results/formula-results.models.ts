import { FormulaFieldValidation, FormulaTarget } from '../targets/formula-targets';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { PickerItem } from '../../fields/picker/models/picker-item.model';
import { FieldPropsPicker } from '../../state/fields-configs.model';

export interface RunFormulasResult {
  settings: FieldSettings;
  validation: FormulaFieldValidation;
  value: FieldValue;
  fields: NameValuePair[];
  opts: FieldPropsPicker;
  sel: FieldPropsPicker;
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
  fields?: NameValuePair[];
  stop?: boolean | null;

  /** WIP v18 */
  options?: PickerItem[];

  /** WIP v18 */
  selected?: PickerItem[];

  /** Decide if the formula should sleep (not be executed) until the source data changes again */
  sleep?: boolean;

  /** Note: not a real result, for internal use only */
  openInDesigner?: boolean;
}

export interface NameValuePair<T = FieldValue> {
  name: string;
  value: T;
}


