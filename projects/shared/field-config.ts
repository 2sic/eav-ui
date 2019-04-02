export interface FieldConfig {
  /**
   * Static name of the field
   */
  name: string;
  /**
   * Ordering index of the field inside the form
   */
  index: number;
  /**
   * Field label
   */
  label: string;
  /**
   * Field placeholder text
   */
  placeholder: string;
  /**
   * Input type of the field.
   * e.g. string-default, string-dropdown, etc.
   */
  inputType: string;
  /**
   * Data type of the field.
   * e.g. String, Hyperlink, Entity, etc.
   */
  type: string;
  /**
   * Tells whether the field is required
   */
  required: boolean;
  /**
   * Tells whether the field is disabled
   */
  disabled: boolean;
}
