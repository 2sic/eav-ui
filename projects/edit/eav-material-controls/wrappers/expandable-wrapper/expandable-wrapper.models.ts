import { BaseFieldTemplateVars } from '../../input-types/base/base-field-template-vars.model';

export interface ExpandableWrapperTemplateVars extends BaseFieldTemplateVars {
  value: string;
  label: string;
  required: boolean;
  invalid: boolean;
  focused: boolean;
  dirty: boolean;
}
