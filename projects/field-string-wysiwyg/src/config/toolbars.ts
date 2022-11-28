import { AddContentBlock, ContentDivision, ToFullscreen, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeDefault, SxcImages, AddContentSplit, H3Group, ToolbarModeToggle, H4Group } from './buttons';
import { TinyEavButtons, TinyEavConfig } from './tinymce-config';
import { TinyMceMode, TinyMceModeWithSwitcher, ToolbarSwitcher, WysiwygMode, WysiwygView, WysiwygInline, WysiwygDialog, WysiwygDefault, WysiwygAdvanced } from './tinymce-helper-types';

type ButtonSet = Record<WysiwygMode, string>;
type ButtonSetConfig = Record<WysiwygMode, boolean>;
const NoButtons = ''; // must be empty string

const Bs1Intro: ButtonSet = {
  default: ` ${ToolbarModeToggle} undo redo pastetext`,
  advanced: ` ${ToolbarModeToggle} undo pastetext`,
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
  default: `h2 ${H3Group}`,
  advanced: `h2 ${H3Group}`,
  text: `h2 h3 ${H4Group}`,
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
      toolbar: this.toolbar(mode, config),
      contextmenu: selectFromSet(BsContextMenu, WysiwygAdvanced)
        + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : ''),
    };
  }

  private toolbar(mode: WysiwygMode, cnf: TinyEavButtons): string {
    const list = [
      selectFromSet(Bs1Intro, mode),
      selectFromSet(Bs2Format, mode),
      selectFromSet(Bs3Headings, mode),
      selectFromSet(Bs4NumList, mode),
      selectFromSet(Bs5Links, mode),
      (selectFromSet(Bs6RichMedia, mode) ? this.richContent() : null),
      (selectFromSet(Bs7ContentBlocks, mode) ? this.contentBlocks() : null),
      [
        cnf.source && Bs91Code,
        cnf.advanced && selectFromSet(Bs92Advanced, mode),
        cnf.advanced && selectFromSet(Bs93CloseAdvanced, mode),
        selectFromSet(Bs99FullScreen, mode),
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
