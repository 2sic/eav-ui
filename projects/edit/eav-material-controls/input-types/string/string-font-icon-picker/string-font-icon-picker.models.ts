import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export class IconOption {
  rule: CSSRule;
  class: string;
  /** Prepared search (usually the class in lower case) */
  search: string;
  /** Label for showing in the dropdown */
  label: string;
}

export class LoadedIcons {
  [key: string]: boolean;
}

export interface StringFontIconPickerTemplateVars extends BaseFieldTemplateVars {
  value: string;
  filteredIcons: IconOption[];
  previewCss: string;
  label: string;
  placeholder: string;
  required: boolean;
}
