import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface StringDropdownTemplateVars extends BaseFieldTemplateVars {
  label: string;
  placeholder: string;
  required: boolean;
  enableTextEntry: boolean;
  dropdownOptions: DropdownOption[];
  freeTextMode: boolean;
}
