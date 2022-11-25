import { AddContentBlock, ContentDivision, ToFullscreen, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeDefault, SxcImages, AddContentSplit, H3Group, ToolbarModes } from './buttons';
import { TinyMceModeConfig } from './tinymce-config';
import { TinyMceMode, TinyMceModes, ToolbarSwitcher, WysiwygMode, WysiwygView, WysiwygInline, WysiwygDialog, WysiwygDefault, WysiwygAdvanced, WysiwygModeText, WysiwygModeMedia } from './tinymce-helper-types';

const StdUndoRedo = ' undo redo removeformat ';
const StdFormat = `| bold ${ItalicWithMore} `;
const StdHeadings = `| h2 ${H3Group} `;
const StdNumList = `| numlist ${ListGroup} `;

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

  private toolbarBasis(mode: WysiwygMode): string {
    switch (mode) {
      case WysiwygModeText: return ''
        + StdUndoRedo
        + StdFormat
        + StdHeadings
        // + this.richContent()
        + StdNumList;
      case WysiwygModeMedia: return ''
        + StdUndoRedo
        // + StdFormat
        // + StdHeadings
        + this.richContent()
        // + StdNumList
        ;
      default: return ''
        + StdUndoRedo
        + StdFormat
        + StdHeadings
        + this.richContent()
        + StdNumList;
    }

  }

  private advanced(isInline: boolean): TinyMceMode {
    return {
      currentMode: {
        view: isInline ? WysiwygInline : WysiwygDialog,
        mode: WysiwygAdvanced,
      },
      menubar: true,
      toolbar: ''
        +  StdUndoRedo
        + '| styles '
        + StdFormat
        + StdHeadings
        + this.richContent()
        + '| numlist bullist outdent indent '
        + '| ' + (!isInline ? ` ${SxcImages} ${LinkFiles} ` : '') + ` ${LinkGroupPro} `
        + this.contentBlocks()
        + ' code '
        + ` ${ModeDefault} ` + (isInline ? ` ${ToFullscreen} ` : ''),
      contextmenu: 'link image | charmap hr adamimage ' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }

  private dialog(mode: WysiwygMode): TinyMceMode {
    var cnf = this.config.buttons.dialog;
    return {
      currentMode: {
        view: WysiwygDialog,
        mode: mode,
      },
      menubar: false,
      toolbar: ''
        + this.toolbarBasis(mode)
        + `| ${LinkFiles} ${LinkGroup} `
        + this.contentBlocks()
        + (cnf.source ? ' code ' : '')
        + (cnf.advanced ? ` ${ModeAdvanced} ` : ''),
      contextmenu: 'charmap hr' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }

  private inline(mode: WysiwygMode): TinyMceMode {
    var cnf = this.config.buttons.inline;
    return {
      currentMode: {
        view: WysiwygInline,
        mode: mode,
      },
      menubar: false,
      toolbar: ''
        + this.toolbarBasis(mode)
        + `| ${LinkGroup} `
        + this.contentBlocks()
        + ` ${ToolbarModes} `
        + (cnf.source ? ' code ' : '')
        + (cnf.advanced ? ` ${ModeAdvanced} ` : '')
        + ` ${ToFullscreen} `,
      contextmenu: 'charmap hr' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }
}
