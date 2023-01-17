// tslint:disable-next-line: max-line-length
import { AddContentBlock, AddContentSplit, ContentDivision, HGroups, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeDefault, SxcImages, ToFullscreen, ToolbarModeToggle } from './public';
import { TinyEavButtons, TinyEavConfig } from './tinymce-config';
// tslint:disable-next-line: max-line-length
import { TinyMceMode, TinyMceModeWithSwitcher, ToolbarSwitcher, WysiwygAdvanced, WysiwygDefault, WysiwygDialog, WysiwygInline, WysiwygMode, WysiwygView } from './tinymce-helper-types';

type ButtonSet = Record<WysiwygMode, string | boolean>;
type ButtonSetByView = Record<WysiwygView | 'default', ButtonSet>;
const NoButtons = ''; // must be empty string

function expandSet(original: Partial<ButtonSet>): ButtonSetByView {
  return expandSetByView({ default: original });
}

function expandSetByView(original: Partial<Record<WysiwygView | 'default', Partial<ButtonSet>>>): ButtonSetByView {
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

const BSet1Intro = expandSet({
  // #v1500-not-ready
  // default: ` ${ToolbarModeToggle} undo redo pastetext`,
  // advanced: ` ${ToolbarModeToggle} undo pastetext`,
  default: `  undo redo pastetext paste removeformat`,
  // advanced: ` undo redo pastetext paste removeformat`,
  text: `${ToolbarModeToggle} undo redo pastetext paste removeformat`,
  media: `${ToolbarModeToggle} undo pastimage-todo `  // TODO: create pasteimage
});

const BSet2Format = expandSet({
  default: `bold ${ItalicWithMore}`,
  advanced: `styles bold ${ItalicWithMore}`,
  text: `bold ${ItalicWithMore}`,
  media: NoButtons,
});

const BSet3Headings = expandSet({
  default: `h2 ${HGroups.h3}`,
  // advanced: `h2 ${HGroups.h3}`,
  text: `h2 h3 ${HGroups.h4}`,
  media: NoButtons,
});

const BSet4NumList = expandSet({
  default: `numlist ${ListGroup}`,
  // advanced: `numlist ${ListGroup}`,
  text: 'numlist bullist outdent indent',
  media: NoButtons
});

const BSet5Links = expandSetByView({
  default: {
    default: `${LinkGroup}`,
    advanced: `${LinkGroupPro}`, // test
    // text: `${LinkGroup}`,
    media: `${SxcImages} ${LinkFiles}`,
  },
  dialog: {
    default: `${SxcImages} ${LinkGroupPro}`,
    advanced: `${SxcImages} ${LinkGroupPro}`,
  }
});

const BSet6RichMedia = expandSet({
  default: false,
  advanced: false,
  text: false,
  media: true,
});

const BSet7ContentBlocks = expandSet({
  default: true,
  advanced: false,
  text: false,
  media: true,
});

const BSet91Code = 'code';
const BSet92Advanced = expandSet({
  default: ModeAdvanced,
  advanced: NoButtons,
  text: NoButtons,
  media: NoButtons,
});
const BSet93CloseAdvanced = expandSet({
  default: NoButtons,
  advanced: ModeDefault,
  text: NoButtons,
  media: NoButtons,
});
const BSet99FullScreen = expandSetByView({
  default: {
    default: ToFullscreen,
    advanced: NoButtons,
    text: NoButtons,
    media: NoButtons,
  },
  dialog: {
    default: NoButtons,
  }
});

const ButtonSetContextMenu = expandSet({
  default: 'charmap hr',
  // advanced: 'charmap hr',
  text: 'charmap hr | link',
  media: 'charmap hr | link image'
});



function selectFromSet(groups: ButtonSetByView, mode: WysiwygMode, view: WysiwygView) {
  const set = groups[view] ?? groups.default;
  return set?.[mode];
}
export class TinyMceToolbars implements ToolbarSwitcher {

  constructor(private config: TinyEavConfig) {
  }

  public build(isInline: boolean): TinyMceModeWithSwitcher {
// console.log('2dm inline', isInline);
    const initial = this.switch(isInline ? WysiwygInline : WysiwygDialog, WysiwygDefault);
    return {
      modeSwitcher: this,
      ...initial
    };
  }

  public switch(view: WysiwygView, mode: WysiwygMode): TinyMceMode {
    const config = this.config.buttons[view];
    return {
      currentMode: {
        view,
        mode,
      },
      menubar: mode === WysiwygAdvanced,
      toolbar: this.toolbar(mode, view, config),
      contextmenu: selectFromSet(ButtonSetContextMenu, WysiwygAdvanced, view)
        + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : ''),
    };
  }

  private toolbar(mode: WysiwygMode, view: WysiwygView, config: TinyEavButtons): string {
// console.log('2dm advanced', config.advanced, config, mode);
    const list = [
      selectFromSet(BSet1Intro, mode, view),
      selectFromSet(BSet2Format, mode, view),
      selectFromSet(BSet3Headings, mode, view),
      selectFromSet(BSet4NumList, mode, view),
      selectFromSet(BSet5Links, mode, view),
      (selectFromSet(BSet6RichMedia, mode, view) ? this.richContent() : null),
      (selectFromSet(BSet7ContentBlocks, mode, view) ? this.contentBlocks() : null),
      [
        config.source && BSet91Code,
        config.advanced && selectFromSet(BSet92Advanced, mode, view),
        config.advanced && selectFromSet(BSet93CloseAdvanced, mode, view),
        // must only allow full screen if allowed
        selectFromSet(BSet99FullScreen, mode, view),
      ].join(' '),
    ];
    return list.join(' | ');
  }

  private richContent(): string {
    return this.config.features.wysiwygEnhanced ? `${ContentDivision} ${AddContentSplit}` : null;
  }

  private contentBlocks(): string {
    return this.config.features.contentBlocks ? AddContentBlock : null;
  }
}
