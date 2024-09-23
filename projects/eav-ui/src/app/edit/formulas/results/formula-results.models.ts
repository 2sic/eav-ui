import { FormulaFieldValidation, FormulaTarget } from '../targets/formula-targets';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { PickerItem } from '../../fields/picker/models/picker-item.model';
import { FieldPropsPicker } from '../../state/fields-configs.model';

/**
 * Things to fully identify a formula.
 * Used for caching and also to know what formula is being edited in the designer. 
 */
export interface FormulaIdentifier {
  /** The entity it's for */
  entityGuid: string;
  /** The field it's for */
  fieldName: string;
  /** ?? */
  target: FormulaTarget;
}

/**
 * Results object of running all formulas for a field.
 */
export interface FieldFormulasResult {
  /** The field settings */
  settings: FieldSettings;

  /** The formula validation result */
  validation: FormulaFieldValidation;

  /** The field value */
  value: FieldValue;

  /** Additional fields to update */
  fields: NameValuePair[];

  /** The options to use (for pickers), new v18 */
  options: FieldPropsPicker;

  /** The selected data (for pickers), new v18 */
  selected: FieldPropsPicker;
}

export type FieldFormulasResultPartialSettings = Omit<FieldFormulasResult, "settings"> & { settings: Partial<FieldSettings> };

export interface FieldFormulasResultRaw {
  value?: FieldValue;
  promise?: Promise<FieldFormulasResultRaw>;
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

export type FieldValueOrResultRaw = FieldValue | FieldFormulasResultRaw;
