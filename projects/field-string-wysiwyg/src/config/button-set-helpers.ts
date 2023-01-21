import { SelectSettings } from './tinymce-config';
import { WysiwygMode, WysiwygView } from './tinymce-helper-types';

type ButtonSetValue = string | boolean | ((settings: SelectSettings) => string | boolean);
type ButtonSet = Record<WysiwygMode, ButtonSetValue>;
type ButtonSetByView = Record<WysiwygView | 'default', ButtonSet>;
export const NoButtons = ''; // must be empty string



export function expandSet(original: Partial<ButtonSet>): ButtonSetByView {
  return expandSetByView({ default: original });
}

export function expandSetByView(original: Partial<Record<WysiwygView | 'default', Partial<ButtonSet>>>): ButtonSetByView {
  const origSet = original.default;
  const defSet = buildSet(origSet.default, origSet);
  return {
    default: defSet,
    inline: { ...defSet, ...original.inline },
    dialog: { ...defSet, ...original.dialog }
  };
}

function buildSet(def: ButtonSetValue, defSet: Partial<ButtonSet>): ButtonSet {
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

  public select(groups: ButtonSetByView) {
    const set = groups[this.settings.view] ?? groups.default;
    const result = set?.[this.settings.mode];
    return ' ' + this.runOrReturn(result) + ' ';
  }

  public runOrReturn(value: ButtonSetValue) {
    if (typeof value === 'function')
      return value(this.settings);
    return value;
  }
}
