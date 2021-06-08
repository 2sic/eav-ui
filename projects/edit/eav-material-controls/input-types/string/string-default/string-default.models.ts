import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface StringDefaultTemplateVars extends BaseFieldTemplateVars {
  fontFamily: '' | 'monospace';
  rowCount: number;
  label: string;
  placeholder: string;
  required: boolean;
}
