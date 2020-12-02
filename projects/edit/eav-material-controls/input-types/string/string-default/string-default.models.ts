import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface StringDefaultTemplateVars extends BaseFieldTemplateVars {
  rowCount: number;
  label: string;
  placeholder: string;
  required: boolean;
}
