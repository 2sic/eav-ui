// tslint:disable-next-line: max-line-length
import { AddContentBlock, AddContentSplit, ContentDivision, HGroups, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeDefault, SxcImages, ToFullscreen, ToolbarModeToggle } from './public';
import { TinyEavButtons, TinyEavConfig } from './tinymce-config';
// tslint:disable-next-line: max-line-length
import { TinyMceMode, TinyMceModeWithSwitcher, ToolbarSwitcher, WysiwygAdvanced, WysiwygDefault, WysiwygDialog, WysiwygInline, WysiwygMode, WysiwygView } from './tinymce-helper-types';

type ButtonSet = Record<WysiwygMode, string>;
type ButtonSetConfig = Record<WysiwygMode, boolean>;
const NoButtons = ''; // must be empty string

const Bs1Intro: ButtonSet = {
  // #v1500-not-ready
  // default: ` ${ToolbarModeToggle} undo redo pastetext`,
  // advanced: ` ${ToolbarModeToggle} undo pastetext`,
  default: `  undo redo pastetext paste removeformat`,
  advanced: ` undo redo pastetext paste removeformat`,
  text: ` ${ToolbarModeToggle} undo redo pastetext paste removeformat`,
  media: ` ${ToolbarModeToggle} undo pastimage-todo `  // TODO: create pasteimage
};

const Bs2Format: ButtonSet = {
  default: `bold ${ItalicWithMore}`,
  advanced: `styles bold ${ItalicWithMore}`,
  text: `bold ${ItalicWithMore}`,
  media: NoButtons,
};

const Bs3Headings: ButtonSet = {
  default: `h2 ${HGroups.h3}`,
  advanced: `h2 ${HGroups.h3}`,
  text: `h2 h3 ${HGroups.h4}`,
  media: NoButtons,
};

const Bs4NumList: ButtonSet = {
  default: `numlist ${ListGroup}`,
  advanced: `numlist ${ListGroup}`,
  text: 'numlist bullist outdent indent',
  media: NoButtons
};

const Bs5Links: ButtonSet = {
  default: `${LinkGroup}`,
  advanced: `${LinkGroupPro}`,
  text: `${LinkGroup}`,
  media: `${SxcImages} ${LinkFiles}`
};

const Bs6RichMedia: ButtonSetConfig = {
  default: false,
  advanced: false,
  text: false,
  media: true,
};

const Bs7ContentBlocks: ButtonSetConfig = {
  default: true,
  advanced: false,
  text: false,
  media: true,
};

const Bs91Code = 'code';
const Bs92Advanced: ButtonSet = {
  default: ModeAdvanced,
  advanced: NoButtons,
  text: NoButtons,
  media: NoButtons,
};
const Bs93CloseAdvanced: ButtonSet = {
  default: NoButtons,
  advanced: ModeDefault,
  text: NoButtons,
  media: NoButtons,
};
const Bs99FullScreen: ButtonSet = {
  default: ToFullscreen,
  advanced: ToFullscreen,
  text: NoButtons,
  media: NoButtons,
};

const BsContextMenu: ButtonSet = {
  default: 'charmap hr',
  advanced: 'charmap hr',
  text: 'charmap hr | link',
  media: 'charmap hr | link image adamimage'// TODO: what is adamimage?
};


function selectFromSet(set: ButtonSet | ButtonSetConfig, mode: WysiwygMode) {
  return set?.[mode];
}

export class TinyMceToolbars implements ToolbarSwitcher {

  constructor(private config: TinyEavConfig) {
  }

  public build(isInline: boolean): TinyMceModeWithSwitcher {
console.log('2dm inline', isInline);
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
      contextmenu: selectFromSet(BsContextMenu, WysiwygAdvanced)
        + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : ''),
    };
  }

  private toolbar(mode: WysiwygMode, view: WysiwygView, config: TinyEavButtons): string {
// console.log('2dm advanced', config.advanced, config, mode);
    const list = [
      selectFromSet(Bs1Intro, mode),
      selectFromSet(Bs2Format, mode),
      selectFromSet(Bs3Headings, mode),
      selectFromSet(Bs4NumList, mode),
      selectFromSet(Bs5Links, mode),
      (selectFromSet(Bs6RichMedia, mode) ? this.richContent() : null),
      (selectFromSet(Bs7ContentBlocks, mode) ? this.contentBlocks() : null),
      [
        config.source && Bs91Code,
        config.advanced && selectFromSet(Bs92Advanced, mode),
        config.advanced && selectFromSet(Bs93CloseAdvanced, mode),
        // must only allow full screen if allowed
        view !== 'dialog' && selectFromSet(Bs99FullScreen, mode),

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
