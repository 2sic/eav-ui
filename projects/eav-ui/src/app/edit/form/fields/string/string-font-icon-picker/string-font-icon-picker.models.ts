import { BaseFieldViewModel } from '../../base/base-field-template-vars.model';

export interface IconOption {
  rule: CSSRule;
  class: string;
  /** Prepared search (usually the class in lower case) */
  search: string;
  /** Label for showing in the dropdown */
  label: string;
}

export interface StringFontIconPickerViewModel extends BaseFieldViewModel {
  filteredIcons: IconOption[];
  previewCss: string;
}
