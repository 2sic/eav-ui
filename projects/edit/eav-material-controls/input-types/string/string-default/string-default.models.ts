import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface StringDefaultTemplateVars extends BaseFieldTemplateVars {
  inputFontFamily: '' | 'monospace';
  rowCount: number;
}
