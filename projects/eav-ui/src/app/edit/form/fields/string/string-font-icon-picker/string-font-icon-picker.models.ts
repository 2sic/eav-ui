export interface IconOption {
  rule: CSSRule;
  class: string;
  /** Prepared search (usually the class in lower case) */
  search: string;
  /** Label for showing in the dropdown */
  label: string;
}

export interface StringFontIconPickerViewModel {
  filteredIcons: IconOption[];
  previewCss: string;
}
