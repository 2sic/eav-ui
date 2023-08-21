import { BaseFieldViewModel } from '../../base/base-field-template-vars.model';

export interface StringTemplatePickerViewModel extends BaseFieldViewModel {
  templateOptions: string[];
}

export interface TemplateSpec {
  /** File extension like '.cshtml' */
  ext: '.html' | '.cshtml' | '.cs';
  /** Purpose for the server to use the right template when creating */
  purpose: 'Template' | 'Search';
  /** Addition to purpose, e.g. purpose=template&type=razor */
  type?: 'Token' | 'Razor';
}

export interface TemplateTypes {
  [key: string]: TemplateSpec;
}
