import { WysiwygMode, WysiwygView } from './tinymce-helper-types';

type ButtonSet = Record<WysiwygMode, string | boolean>;
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

function buildSet(def: string | boolean, defSet: Partial<ButtonSet>): ButtonSet {
  return {
    default: def,
    advanced: defSet.advanced ?? def,
    text: defSet.text ?? def,
    media: defSet.media ?? def,
  };
}


export function selectFromSet(groups: ButtonSetByView, mode: WysiwygMode, view: WysiwygView) {
  const set = groups[view] ?? groups.default;
  return set?.[mode];
}