import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface IconOption {
  rule: CSSRule;
  class: string;
  /** Prepared search (usually the class in lower case) */
  search: string;
  /** Label for showing in the dropdown */
  label: string;
}

export interface StringFontIconPickerTemplateVars extends BaseFieldTemplateVars {
  value: string;
  filteredIcons: IconOption[];
  previewCss: string;
  label: string;
  placeholder: string;
  required: boolean;
}
