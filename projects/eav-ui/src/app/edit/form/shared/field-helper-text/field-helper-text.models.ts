import { FieldSettings } from '../../../../../../../edit-types';

export interface FieldHelperTextViewModel {
  invalid: boolean;
  disabled: boolean;
  description: string;
  settings: FieldSettings;
}
