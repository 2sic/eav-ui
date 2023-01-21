import { SelectSettings } from './tinymce-config';
import { WysiwygMode, WysiwygView } from './tinymce-helper-types';

type ButtonGroupValue = string | string[] | ((settings: SelectSettings) => string | string[]);
type ButtonGroup = Record<WysiwygMode, ButtonGroupValue>;
type ButtonGroupByView = Record<WysiwygView, ButtonGroup | null>;
export const NoButtons = ''; // must be empty string
export const NewRow = "\n";  // must be newline


export function expandSet(
  //defaults: Partial<ButtonGroup>,
  original: Partial<Record<WysiwygView | 'all', Partial<ButtonGroup>>>
): ButtonGroupByView {
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

export class ButtonSetSelector {
  constructor(public settings: SelectSettings) {
  }

  public select(groups: ButtonGroupByView) {
    const set = groups[this.settings.view];
    const result = set?.[this.settings.mode];
    return [this.runOrReturn(result)].flat(); //.map(r => ' ' + r + ' ');
  }

  public runOrReturn(value: ButtonGroupValue) {
    if (typeof value === 'function')
      return value(this.settings);
    return value;
  }
}
