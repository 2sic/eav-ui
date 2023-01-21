import { SelectSettings } from './tinymce-config';
import { WysiwygMode, WysiwygView } from './tinymce-helper-types';

export type ButtonGroupValue = string | string[] | ((settings: SelectSettings) => string | string[]);
export type ButtonGroup = Record<WysiwygMode, ButtonGroupValue>;
export type ButtonGroupByView = Record<WysiwygView, ButtonGroup>;
export type ButtonGroupByViewRaw = Partial<Record<WysiwygView | 'all', Partial<ButtonGroup>>>;
export const NoButtons = ''; // must be empty string
export const NewRow = "\n";  // must be newline


export function toButtonGroupByView(original: ButtonGroupByViewRaw): ButtonGroupByView {
  const all = original.all;
  const defSet = all?.default ? buildOneButtonGroup(all.default, all) : null;
  return {
    inline: { ...defSet, ...original.inline },
    dialog: { ...defSet, ...original.dialog }
  };
}

function buildOneButtonGroup(def: ButtonGroupValue, defSet: Partial<ButtonGroup>): ButtonGroup {
  return {
    default: def,
    advanced: defSet.advanced ?? def,
    text: defSet.text ?? def,
    media: defSet.media ?? def,
  };
}
