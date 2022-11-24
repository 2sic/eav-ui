import { AddContentBlock, ContentDivision, ExpandFullEditor, HGroup, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeInline, ModeStandard, SxcImages, AddContentSplit } from './buttons';
import { TinyMceMode, TinyMceModes } from './tinymce-helper-types';



export class TinyMceToolbars {
  static build(contentBlocksEnabled: boolean, inlineMode: boolean, buttonSource: boolean, buttonAdvanced: boolean, contentDivisions: boolean): TinyMceModes {
    // contentDivisions = 'false';
    const modes = {
      inline: this.inline(contentBlocksEnabled, buttonSource, buttonAdvanced, contentDivisions),
      standard: this.standard(contentBlocksEnabled, buttonSource, buttonAdvanced, contentDivisions),
      advanced: this.advanced(inlineMode, contentBlocksEnabled, contentDivisions),
    };
    return {
      modes,
      menubar: inlineMode ? modes.inline.menubar : modes.standard.menubar,
      toolbar: inlineMode ? modes.inline.toolbar : modes.standard.toolbar,
      contextmenu: inlineMode ? modes.inline.contextmenu : modes.standard.contextmenu,
    };
  }

  private static advanced(inlineMode: boolean, contentBlocksEnabled: boolean, contentDivisions: boolean): TinyMceMode {
    return {
      menubar: true,
      toolbar: ' undo redo removeformat '
        + '| styles '
        + '| bold italic '
        + `| h2 h3 ${HGroup} `
        + '| '
        + (contentDivisions ? ` ${ContentDivision} ${AddContentSplit} ` : '')
        + '| numlist bullist outdent indent '
        + '| ' + (!inlineMode ? ` ${SxcImages} ${LinkFiles} ` : '') + ` ${LinkGroupPro} `
        + '| '
        + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
        + ' code '
        + (inlineMode ? ` ${ModeInline} ${ExpandFullEditor} ` : ` ${ModeStandard} `),
      contextmenu: 'link image | charmap hr adamimage' + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
    };
  }

  private static standard(contentBlocksEnabled: boolean, source: boolean, advanced: boolean, contentDivisions: boolean): TinyMceMode {
    return {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + `| bold ${ItalicWithMore} `
        + `| h2 h3 ${HGroup} `
        + '| '
        + (contentDivisions ? ` ${ContentDivision} ${AddContentSplit} ` : '')
        + `| numlist ${ListGroup} `
        + `| ${LinkFiles} ${LinkGroup} `
        + '| '
        + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
        + (source ? ' code ' : '')
        + (advanced ? ` ${ModeAdvanced} ` : ''),
      contextmenu: 'charmap hr' + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
    };
  }

  private static inline(contentBlocksEnabled: boolean, source: boolean, advanced: boolean, contentDivisions: boolean): TinyMceMode {
    return {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + `| bold ${ItalicWithMore} `
        + `| h2 h3 ${HGroup} `
        + '| '
        + (contentDivisions ? ` ${ContentDivision} ${AddContentSplit} ` : '')
        + `| numlist ${ListGroup} `
        + `| ${LinkGroup} `
        + '| '
        + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
        + (source ? ' code ' : '')
        + (advanced ? ` ${ModeAdvanced} ` : '')
        + ` ${ExpandFullEditor} `,
      contextmenu: 'charmap hr' + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
    };
  }
}
