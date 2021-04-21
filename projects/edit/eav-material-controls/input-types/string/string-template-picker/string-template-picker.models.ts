import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface StringTemplatePickerTemplateVars extends BaseFieldTemplateVars {
  label: string;
  required: boolean;
  templateOptions: string[];
}

export interface TemplateSpec {
  ext: string;
  prefix: string;
  suggestion: string;
}

export interface TemplateTypes {
  [key: string]: TemplateSpec;
}
