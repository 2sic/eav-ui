import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface NumberDefaultTemplateVars extends BaseFieldTemplateVars {
  min: number;
  max: number;
}
