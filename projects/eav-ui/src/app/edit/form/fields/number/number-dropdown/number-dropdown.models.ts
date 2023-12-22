import { DropdownOption } from '../../../../../../../../edit-types';
import { BaseFieldViewModel } from '../../base/base-field-template-vars.model';

export interface NumberDropdownTemplateVars extends BaseFieldViewModel {
  enableTextEntry: boolean;
  dropdownOptions: DropdownOption[];
  freeTextMode: boolean;
}
