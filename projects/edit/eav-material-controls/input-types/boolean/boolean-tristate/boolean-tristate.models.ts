import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface BooleanTristateTemplateVars extends BaseFieldTemplateVars {
  value: boolean | '';
  label: string;
}
