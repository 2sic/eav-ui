/** Prefix for any kind of field settings */
export const SettingsFormulaPrefix = 'Field.Settings.';



/** Default targets for formulas */
export const FormulaDefaultTargets = {
  Disabled: `${SettingsFormulaPrefix}Disabled`,
  Name: `${SettingsFormulaPrefix}Name`,
  Notes: `${SettingsFormulaPrefix}Notes`,
  Required: `${SettingsFormulaPrefix}Required`,
  Value: 'Field.Value',
  Visible: `${SettingsFormulaPrefix}Visible`,
  Validation: 'Field.Validation',
};

/** Values of the Default Targets (used often, so precalculated) */
export const FormulaDefaultTargetValues = Object.values(FormulaDefaultTargets);



/** Targets for new Pickers only */
export const FormulaNewPickerTargets = {
  Options: 'Field.Options',
  Selected: 'Field.Selected',
};

/** Values of the NewPicker Targets (used often, so precalculated) */
export const FormulaNewPickerTargetValues = Object.values(FormulaNewPickerTargets);

export const FormulaSpecialPickerTargets = [
  FormulaNewPickerTargets.Options,
  // FormulaDefaultTargets.Value,
  FormulaNewPickerTargets.Selected,
];

/** These formulas should auto-sleep unless specified otherwise */
export const FormulaSpecialPickerAutoSleep = [
  FormulaNewPickerTargets.Options,
  FormulaNewPickerTargets.Selected,
];



export const FormulaOptionalTargets = {
  Collapsed: `${SettingsFormulaPrefix}Collapsed`,
  DropdownValues: `${SettingsFormulaPrefix}DropdownValues`,
};

export const FormulaOptionalTargetValues = Object.values(FormulaOptionalTargets);



/** All possible targets for formulas (merged) */
export const FormulaTargets = {
  ...FormulaDefaultTargets,
  ...FormulaOptionalTargets,
  ...FormulaNewPickerTargets,
} as const /* the as const ensures that the keys/values can be strictly checked */;

/** Validation object interface */
export interface FormulaFieldValidation {
  severity: '' | 'error' | 'warning';
  message?: string;
}

