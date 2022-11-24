import { AddContentBlock, ContentDivision, ExpandFullEditor, HGroup, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeInline, ModeStandard, SxcImages, AddContentSplit } from './buttons';
import { TinyMceModeConfig } from './tinymce-config';
import { TinyMceMode, TinyMceModes } from './tinymce-helper-types';



export class TinyMceToolbars {
  
  constructor(private config: TinyMceModeConfig) {

  }

  public build(inlineMode: boolean): TinyMceModes {
    const modes = {
      inline: this.inline(),
      standard: this.dialog(),
      advanced: this.advanced(inlineMode),
    };
    return {
      modes,
      menubar: inlineMode ? modes.inline.menubar : modes.standard.menubar,
      toolbar: inlineMode ? modes.inline.toolbar : modes.standard.toolbar,
      contextmenu: inlineMode ? modes.inline.contextmenu : modes.standard.contextmenu,
    };
  }

  private advanced(inlineMode: boolean): TinyMceMode {
    var cnf = inlineMode ?  this.config.buttons.inline : this.config.buttons.dialog;
    return {
      menubar: true,
      toolbar: ' undo redo removeformat '
        + '| styles '
        + '| bold italic '
        + `| h2 h3 ${HGroup} `
        + '| '
        + (cnf.contentDivisions ? ` ${ContentDivision} ${AddContentSplit} ` : '')
        + '| numlist bullist outdent indent '
        + '| ' + (!inlineMode ? ` ${SxcImages} ${LinkFiles} ` : '') + ` ${LinkGroupPro} `
        + '| '
        + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
        + ' code '
        + (inlineMode ? ` ${ModeInline} ${ExpandFullEditor} ` : ` ${ModeStandard} `),
      contextmenu: 'link image | charmap hr adamimage ' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }

  private dialog(): TinyMceMode {
    var cnf = this.config.buttons.dialog;
    return {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + `| bold ${ItalicWithMore} `
        + `| h2 h3 ${HGroup} `
        + '| '
        + (cnf.contentDivisions ? ` ${ContentDivision} ${AddContentSplit} ` : '')
        + `| numlist ${ListGroup} `
        + `| ${LinkFiles} ${LinkGroup} `
        + '| '
        + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
        + (cnf.source ? ' code ' : '')
        + (cnf.advanced ? ` ${ModeAdvanced} ` : ''),
      contextmenu: 'charmap hr' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }

  private inline(): TinyMceMode {
    var cnf = this.config.buttons.inline;
    return {
      menubar: false,
      toolbar: 
        ` abcdefg ${SxcImages} `
        + ' undo redo removeformat '
        + `| bold ${ItalicWithMore} `
        + `| h2 h3 ${HGroup} `
        + '| '
        + (cnf.contentDivisions ? ` ${ContentDivision} ${AddContentSplit} ` : '')
        + `| numlist ${ListGroup} `
        + `| ${LinkGroup} `
        + '| '
        + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
        + (cnf.source ? ' code ' : '')
        + (cnf.advanced ? ` ${ModeAdvanced} ` : '')
        + ` ${ExpandFullEditor} `,
      contextmenu: 'charmap hr' + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : '')
    };
  }
}
