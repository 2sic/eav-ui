import { FieldSettings } from './field-settings';

// spm remove comments
export interface FieldConfig {
  /** Static name of the field */
  name: string;

  /** Ordering index of the field inside the form */
  index: number;

  /** Field label */
  label: string; // updated on language change

  /** Field placeholder text */
  placeholder: string; // never updated atm. Probably will be

  /** Input type of the field. e.g. string-default, string-dropdown, etc. */
  inputType: string;

  /** Data type of the field. e.g. String, Hyperlink, Entity, etc. */
  type: string;

  /** Tells whether the field is required */
  required: boolean; // updated on language change

  /** Tells whether the field is disabled */
  disabled: boolean;

  /** spm write JSDoc */
  settings: FieldSettings;
}
