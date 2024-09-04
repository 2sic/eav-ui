const ListItemFormulaPrefix = 'Field.ListItem.';

export const SettingsFormulaPrefix = 'Field.Settings.';

export const FormulaListItemTargets = {
  ListItemLabel: `${ListItemFormulaPrefix}Label`,
  ListItemDisabled: `${ListItemFormulaPrefix}Disabled`,
  ListItemTooltip: `${ListItemFormulaPrefix}Tooltip`,
  ListItemInformation: `${ListItemFormulaPrefix}Information`,
  ListItemHelpLink: `${ListItemFormulaPrefix}HelpLink`,
};

export const FormulaOptionalTargets = {
  Collapsed: `${SettingsFormulaPrefix}Collapsed`,
  DropdownValues: `${SettingsFormulaPrefix}DropdownValues`,
};

export const FormulaDefaultTargets = {
  Disabled: `${SettingsFormulaPrefix}Disabled`,
  Name: `${SettingsFormulaPrefix}Name`,
  Notes: `${SettingsFormulaPrefix}Notes`,
  Required: `${SettingsFormulaPrefix}Required`,
  Value: 'Field.Value',
  Visible: `${SettingsFormulaPrefix}Visible`,
  Validation: 'Field.Validation',
};

export const FormulaTargets = {
  ...FormulaDefaultTargets,
  ...FormulaOptionalTargets,
  ...FormulaListItemTargets,
} as const;

export interface FormulaFieldValidation {
  severity: '' | 'error' | 'warning';
  message?: string;
}

export type FormulaTarget = (typeof FormulaTargets)[keyof typeof FormulaTargets];
