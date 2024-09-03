import { FieldConfigSet } from '../../eav-ui/src/app/edit/fields/field-config-set.model';
import { InputTypeStrict } from '../../eav-ui/src/app/shared/fields/input-type-catalog';
import { FieldSettings } from './FieldSettings';

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
   * Input type of the field. e.g. string-default, string-dropdown, etc.
   */
  inputType: InputTypeStrict;
  /**
   * Data type of the field. e.g. String, Hyperlink, Entity, etc.
   */
  type: string;
  /**
   * Tells whether the field is required
   */
  required: boolean;
  /**
   * Tells whether the field is disabled. This is the initial value that was set in settings for this field
   */
  disabled: boolean;
  /**
   * Settings of the field, as configured in the UI
   * This is just a normal dictionary-object with keys having the same names as the fields in the configuration dialog.
   * Note that most keys are PascalCase, not camelCase.
   */
  settings: FieldSettings;
}

export function toFieldConfig(config: FieldConfigSet, settings: FieldSettings): FieldConfig {
  return {
    name: config.fieldName,
    index: config.index,
    label: settings.Name,
    placeholder: settings.Placeholder,
    inputType: config.inputTypeSpecs.inputType,
    type: config.type,
    required: settings._currentRequired,
    disabled: config.initialDisabled,
    settings,
  } satisfies FieldConfig;
}