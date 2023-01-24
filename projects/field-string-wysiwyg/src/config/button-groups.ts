import { ConfigForDisplayEditModes, ConfigForDisplayModesRaw, ConfigForEditModes } from './config-for-view-modes';

export type ButtonGroupValue = string | string[]; // | ((settings: SelectSettings) => string | string[]);
export type ButtonGroup = ConfigForEditModes<ButtonGroupValue>;
export type ButtonGroupByView = ConfigForDisplayEditModes<ButtonGroupValue>;
export type ButtonGroupByViewRaw = ConfigForDisplayModesRaw<ButtonGroup>;
export const NoButtons = ''; // must be empty string
export const NewRow = '\n';  // must be newline

// TODO: this is not well designed yet, as the final form isn't decided
// Still WIP 2023-01-23 2dm
// Goal is to probably merge with the code

export function toButtonGroupByView(original: ButtonGroupByViewRaw): ButtonGroupByView {
  const all = original.all;
  const defSet = all?.default ? buildOneButtonGroup(all.default, all) : null;
  return {
    inline: { ...defSet, ...original.inline },
    dialog: { ...defSet, ...original.dialog }
  };
}

function buildOneButtonGroup(def: ButtonGroupValue, defSet: Partial<ButtonGroup>): ButtonGroup {
  const newValues: ButtonGroup = {};
  Object.entries(defSet).forEach(([fieldName, fieldProps]) => { newValues[fieldName] = fieldProps ?? def; });
  return newValues;
}
