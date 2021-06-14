import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface StringTemplatePickerTemplateVars extends BaseFieldTemplateVars {
  templateOptions: string[];
}

export interface TemplateSpec {
  /** File extension like '.cshtml' */
  ext: string;
  /** File prefix like '_' for Razor */
  prefix: string;
  /** Purpose for the server to use the right template when creating */
  purpose: string;
  /** Suggested file name when showing the create-new dialog */
  suggestion: string;
}

export interface TemplateTypes {
  [key: string]: TemplateSpec;
}
