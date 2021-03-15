import { DropdownOption } from '../../../../../edit-types';
import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface StringDropdownTemplateVars extends BaseFieldTemplateVars {
  label: string;
  placeholder: string;
  required: boolean;
  enableTextEntry: boolean;
  dropdownOptions: DropdownOption[];
  freeTextMode: boolean;
}
