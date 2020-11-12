import { FieldSettings } from './FieldSettings';

export interface FieldConfig {

  /** Static name of the field */
  name: string;

  /** Ordering index of the field inside the form */
  index: number;

  /** Field label */
  label: string; // updated on language change

  /** Field placeholder text */
  placeholder: string; // updated on language change

  /** Input type of the field. e.g. string-default, string-dropdown, etc. */
  inputType: string;

  /** Data type of the field. e.g. String, Hyperlink, Entity, etc. */
  type: string;

  /** Tells whether the field is required */
  required: boolean; // updated on language change

  /** Tells whether the field is disabled. This is the initial value that was set in settings for this field */
  disabled: boolean;

  /**
   * Settings of the field, as configured in the UI
   * This is just a normal dictionary-object with keys having the same names as the fields in the configuration dialog.
   * Note that most keys are PascalCase, not camelCase.
   */
  settings: FieldSettings;
}
