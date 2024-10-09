/**
 * @Boolean
 */
export interface FieldSettingsBoolean {
  TitleTrue: string;
  TitleFalse: string;
  TitleIndeterminate: string;
  ReverseToggle?: boolean;
  /** Label for Boolean fields, calculated on the fly by the logic */
  _label: string;
}
