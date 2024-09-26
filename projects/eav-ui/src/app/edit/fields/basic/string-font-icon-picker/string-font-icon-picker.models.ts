export interface IconOption {
  rule: CSSRule;
  class: string;
  /** Prepared search (usually the class in lower case) */
  search: string;
  /** Label for showing in the dropdown */
  label: string;

  /** Optional: Icon class for new Picker */
  _valueRaw?: string;
  _selector?: string;
  _value?: string;

}
