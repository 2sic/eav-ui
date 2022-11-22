import { AddContentBlock, ContentDivision, ExpandFullEditor, HGroup, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeInline, ModeStandard, SxcImages } from './buttons';

export class TinyMceToolbars {
  // @SDV - buttonAdvanced and contentDivision should be bools right from where they were retrieved first, possibly bool?, but not strings
  static build(contentBlocksEnabled: boolean, inlineMode: boolean, buttonSource: string, buttonAdvanced: string, contentDivisions: string) {
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

  private static advanced(inlineMode: boolean, contentBlocksEnabled: boolean, contentDivisions: string) {
    return {
      menubar: true,
      toolbar: ' undo redo removeformat '
        + '| styles '
        + '| bold italic '
        + `| h2 h3 ${HGroup} `
        + '| '
        + (contentDivisions === 'false' ? '' : ` ${ContentDivision} `)
        + '| numlist bullist outdent indent '
        + '| ' + (!inlineMode ? ` ${SxcImages} ${LinkFiles} ` : '') + ` ${LinkGroupPro} `
        + '| '
        + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
        + ' code '
        + (inlineMode ? ` ${ModeInline} ${ExpandFullEditor} ` : ` ${ModeStandard} `),
      contextmenu: 'link image | charmap hr adamimage' + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
    };
  }

  private static standard(contentBlocksEnabled: boolean, source: string, advanced: string, contentDivisions: string) {
    return {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + `| bold ${ItalicWithMore} `
        + `| h2 h3 ${HGroup} `
        + '| '
        + (contentDivisions === 'false' ? '' : ` ${ContentDivision} `)
        + `| numlist ${ListGroup} `
        + `| ${LinkFiles} ${LinkGroup} `
        + '| '
        + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
        + (source === 'false' ? '' : ' code ')
        + (advanced === 'false' ? '' : ` ${ModeAdvanced} `),
      contextmenu: 'charmap hr' + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
    };
  }

  private static inline(contentBlocksEnabled: boolean, source: string, advanced: string, contentDivisions: string) {
    return {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + `| bold ${ItalicWithMore} `
        + `| h2 h3 ${HGroup} `
        + '| '
        + (contentDivisions === 'false' ? '' : ` ${ContentDivision} `)
        + `| numlist ${ListGroup} `
        + `| ${LinkGroup} `
        + '| '
        + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
        + (source === 'true' ? ' code ' : '')
        + (advanced === 'true' ? ` ${ModeAdvanced} ` : '')
        + ` ${ExpandFullEditor} `,
      contextmenu: 'charmap hr' + (contentBlocksEnabled ? ` ${AddContentBlock} ` : '')
    };
  }
}
