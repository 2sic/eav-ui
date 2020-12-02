import { FieldSettings } from '../../../../edit-types';

export interface FieldHelperTextTemplateVars {
  invalid: boolean;
  description: string;
  settings: FieldSettings;
}
