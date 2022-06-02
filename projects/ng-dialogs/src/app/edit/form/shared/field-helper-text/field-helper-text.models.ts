import { FieldSettings } from '../../../../../../../edit-types';

export interface FieldHelperTextTemplateVars {
  invalid: boolean;
  disabled: boolean;
  description: string;
  settings: FieldSettings;
}
