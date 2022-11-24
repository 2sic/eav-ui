import { AddContentBlock, ContentDivision, ToFullscreen, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeDefault, SxcImages, AddContentSplit, H3Group } from './buttons';
import { TinyMceModeConfig } from './tinymce-config';
import { TinyMceMode, TinyMceModes, ToolbarSwitcher, WysiwygMode, WysiwygView, WysiwygInline, WysiwygDialog, WysiwygDefault, WysiwygAdvanced } from './tinymce-helper-types';

const StdUndoRedo = ' undo redo removeformat ';
const StdFormat = `| bold ${ItalicWithMore} `;
const StdHeadings = `| h2 ${H3Group} `;
const StdNumList = `| numlist ${ListGroup} `;

export class TinyMceToolbars implements ToolbarSwitcher {

  constructor(private config: TinyMceModeConfig) {

  }

  switch(view: WysiwygView, operationMode: WysiwygMode): TinyMceMode {
    return (view == WysiwygInline)
      ? operationMode == WysiwygDefault ? this.inline() : this.advanced(true)
      : operationMode == WysiwygDefault ? this.dialog() : this.advanced(false);
  }

  public build(isInline: boolean): TinyMceModes {
    const modes = {
      inline: this.inline(),
      standard: this.dialog(),
      advanced: this.advanced(isInline),
    };
    const initial = isInline ? modes.inline : modes.standard;
    return {
      modeSwitcher: this,
      modes,
      ...initial
    };
  }

  private richContent(): string {
    return '| ' + (this.config.features.richContent ? ` ${ContentDivision} ${AddContentSplit} ` : '')
  }

  private contentBlocks(): string {
    return '| '+ (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
  }

  private advanced(isInline: boolean): TinyMceMode {
    return {
      currentMode: {
        view: isInline ? WysiwygInline : WysiwygDialog,
        level: WysiwygAdvanced,
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
        // must check - this looks wrong isInline shows ToInlineMode ?
        + (isInline ? ` ${ModeDefault} ${ToFullscreen} ` : ` ${ModeDefault} `),
      contextmenu: 'link image | charmap hr adamimage ' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }

  private dialog(): TinyMceMode {
    var cnf = this.config.buttons.dialog;
    return {
      currentMode: {
        view: WysiwygDialog,
        level: WysiwygDefault,
      },
      menubar: false,
      toolbar: ''
        + StdUndoRedo
        + StdFormat
        + StdHeadings
        + this.richContent()
        + StdNumList
        + `| ${LinkFiles} ${LinkGroup} `
        + this.contentBlocks()
        + (cnf.source ? ' code ' : '')
        + (cnf.advanced ? ` ${ModeAdvanced} ` : ''),
      contextmenu: 'charmap hr' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }

  private inline(): TinyMceMode {
    var cnf = this.config.buttons.inline;
    return {
      currentMode: {
        view: WysiwygInline,
        level: WysiwygDefault,
      },
      menubar: false,
      toolbar: ''
        + StdUndoRedo
        + StdFormat
        + StdHeadings
        + this.richContent()
        + StdNumList
        + `| ${LinkGroup} `
        + this.contentBlocks()
        + (cnf.source ? ' code ' : '')
        + (cnf.advanced ? ` ${ModeAdvanced} ` : '')
        + ` ${ToFullscreen} `,
      contextmenu: 'charmap hr' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }
}
