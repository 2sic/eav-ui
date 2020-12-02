import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface NumberDefaultTemplateVars extends BaseFieldTemplateVars {
  label: string;
  placeholder: string;
  required: boolean;
  min: number;
  max: number;
}
