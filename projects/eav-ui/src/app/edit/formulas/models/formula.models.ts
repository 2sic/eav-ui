import { FieldValue, PickerItem } from '../../../../../../edit-types';
import { FormulaResultRaw } from './formula-results.models';
import { FormulaV1Experimental } from './formula-run-experimental.model';
import { FormulaV1Data } from './formula-run-data.model';
import { FormulaV1Context } from './formula-run-context.model';

export type FormulaFunction = FormulaFunctionDefault | FormulaFunctionV1;

export type FormulaFunctionDefault = () => FieldValue | FormulaResultRaw;

export type FormulaFunctionV1 = (data: FormulaV1Data, context: FormulaV1Context, experimental: FormulaV1Experimental, item: PickerItem)
  => FieldValue | FormulaResultRaw;

export const FormulaVersions = {
  V1: 'v1',
  V2: 'v2',
} as const;

export type FormulaVersion = typeof FormulaVersions[keyof typeof FormulaVersions];

const ListItemFormulaPrefix = 'Field.ListItem.';

export const SettingsFormulaPrefix = 'Field.Settings.';

export const FormulaListItemTargets = {
  ListItemLabel: `${ListItemFormulaPrefix}Label`,
  ListItemDisabled: `${ListItemFormulaPrefix}Disabled`,
  ListItemTooltip: `${ListItemFormulaPrefix}Tooltip`,
  ListItemInformation: `${ListItemFormulaPrefix}Information`,
  ListItemHelpLink: `${ListItemFormulaPrefix}HelpLink`,
}

export const FormulaOptionalTargets = {
  Collapsed: `${SettingsFormulaPrefix}Collapsed`,
  DropdownValues: `${SettingsFormulaPrefix}DropdownValues`,
}

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

export type FormulaTarget = typeof FormulaTargets[keyof typeof FormulaTargets];


