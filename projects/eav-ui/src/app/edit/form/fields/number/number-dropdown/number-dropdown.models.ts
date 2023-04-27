import { DropdownOption } from '../../../../../../../../edit-types';
import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface NumberDropdownTemplateVars extends BaseFieldTemplateVars {
  enableTextEntry: boolean;
  dropdownOptions: DropdownOption[];
  freeTextMode: boolean;
}
