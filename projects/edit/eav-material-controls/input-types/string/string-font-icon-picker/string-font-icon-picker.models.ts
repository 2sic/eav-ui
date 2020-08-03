export class IconOption {
  rule: CSSRule;
  class: string;

  /** The prepared search (usually the class in lower case) */
  search: string;

  /** The label for showing in the dropdown */
  // label: string;
}

export class LoadedIcons {
  [key: string]: boolean;
}
