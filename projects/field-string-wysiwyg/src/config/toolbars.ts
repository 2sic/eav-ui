import { AddContentBlock, ContentDivision, ToFullscreen, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeDefault, SxcImages, AddContentSplit, H3Group, ToolbarModes, ToolbarModeToggle, H4Group } from './buttons';
import { TinyMceButtonsConfig, TinyMceModeConfig } from './tinymce-config';
import { TinyMceMode, TinyMceModes, ToolbarSwitcher, WysiwygMode, WysiwygView, WysiwygInline, WysiwygDialog, WysiwygDefault, WysiwygAdvanced } from './tinymce-helper-types';

type ButtonSet = Record<WysiwygMode, string>;
type ButtonSetConfig = Record<WysiwygMode, boolean>;
const NoButtons = ''; // must be empty string

const Bs1Intro: ButtonSet = {
  default: ` ${ToolbarModeToggle} undo pastetext`,
  advanced: ` ${ToolbarModeToggle} undo pastetext`,
  text: ` ${ToolbarModeToggle} undo redo pastetext paste removeformat`,
  media: ` ${ToolbarModeToggle} undo pastimage-todo `  // TODO: create pasteimage
};

const Bs2Format: ButtonSet = {
  default: `bold ${ItalicWithMore}`,
  advanced: `styles bold ${ItalicWithMore}`,
  text: `bold ${ItalicWithMore}`,
  media: NoButtons,
}

const Bs3Headings: ButtonSet = {
  default: `h2 ${H3Group}`,
  advanced: `h2 ${H3Group}`,
  text: `h2 h3 ${H4Group}`,
  media: NoButtons,
}

const Bs4NumList: ButtonSet = {
  default: `numlist ${ListGroup}`,
  advanced: `numlist ${ListGroup}`,
  text: 'numlist bullist outdent indent',
  media: NoButtons
}

const Bs5Links: ButtonSet = {
  default: `${LinkGroup}`,
  advanced: `${LinkGroupPro}`,
  text: `${LinkGroup}`,
  media: `${SxcImages} ${LinkFiles}`
}

const Bs6RichMedia: ButtonSetConfig = {
  default: false,
  advanced: false,
  text: false,
  media: true,
}

const Bs7ContentBlocks: ButtonSetConfig = {
  default: true,
  advanced: false,
  text: false,
  media: true,
}

const Bs91Code = 'code';
const Bs92Advanced: ButtonSet = {
  default: ModeAdvanced,
  advanced: NoButtons,
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
  media: 'charmap hr | link image adamimage'// hat is adamimage?
}


function selectFromSet(set: ButtonSet | ButtonSetConfig, mode: WysiwygMode) {
  console.log('2dm', mode, set);
  return set?.[mode];
}

export class TinyMceToolbars implements ToolbarSwitcher {

  constructor(private config: TinyMceModeConfig) {

  }

  switch(view: WysiwygView, mode: WysiwygMode): TinyMceMode {
    return (view == WysiwygInline)
      ? mode == WysiwygAdvanced ? this.advanced(true) : this.inline(mode)
      : mode == WysiwygAdvanced ? this.advanced(false) : this.dialog(mode);
  }

  public build(isInline: boolean): TinyMceModes {
    const initial = isInline ? this.inline(WysiwygDefault) : this.dialog(WysiwygDefault);
    return {
      modeSwitcher: this,
      ...initial
    };
  }

  private richContent(): string {
    return '| ' + (this.config.features.richContent ? ` ${ContentDivision} ${AddContentSplit} ` : '')
  }

  private contentBlocks(): string {
    return '| '+ (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
  }

  private toolbarBasis(mode: WysiwygMode, cnf: TinyMceButtonsConfig): string {
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
        selectFromSet(Bs99FullScreen, mode),
      ].join(' '),
    ];
    return list.join(' | ');
  }

  private advanced(isInline: boolean): TinyMceMode {
    var cnf = isInline ? this.config.buttons.inline : this.config.buttons.dialog;
    return {
      currentMode: {
        view: isInline ? WysiwygInline : WysiwygDialog,
        mode: WysiwygAdvanced,
      },
      menubar: true,
      toolbar: this.toolbarBasis(WysiwygAdvanced, cnf),
      contextmenu: selectFromSet(BsContextMenu, WysiwygAdvanced) + ' ' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }

  private dialog(mode: WysiwygMode): TinyMceMode {
    return {
      currentMode: {
        view: WysiwygDialog,
        mode: mode,
      },
      menubar: false,
      toolbar: this.toolbarBasis(mode, this.config.buttons.dialog),
      contextmenu: selectFromSet(BsContextMenu, mode) + ' ' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }

  private inline(mode: WysiwygMode): TinyMceMode {
    return {
      currentMode: {
        view: WysiwygInline,
        mode: mode,
      },
      menubar: false,
      toolbar: this.toolbarBasis(mode, this.config.buttons.dialog),
      contextmenu: selectFromSet(BsContextMenu, mode) + ' ' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }
}
