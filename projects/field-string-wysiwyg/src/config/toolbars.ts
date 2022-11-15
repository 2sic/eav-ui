import { ItalicWithMore, SxcImages } from './buttons';

export class TinyMceToolbars {

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
        + '| h2 h3 hgroup '
        + '| '
        + (contentDivisions === 'false' ? '' : ' contentdivision ')
        + '| numlist bullist outdent indent '
        + `| ' + (!inlineMode ? ' ${SxcImages} linkfiles' : '') + ' linkgrouppro `
        + '| '
        + (contentBlocksEnabled ? ' addcontentblock ' : '')
        + ' code '
        + (inlineMode ? ' modeinline expandfulleditor ' : ' modestandard '),
      contextmenu: 'link image | charmap hr adamimage' + (contentBlocksEnabled ? ' addcontentblock' : '')
    };
  }

  private static standard(contentBlocksEnabled: boolean, source: string, advanced: string, contentDivisions: string) {
    return {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + `| bold ${ItalicWithMore} `
        + '| h2 h3 hgroup '
        + '| '
        + (contentDivisions === 'false' ? '' : ' contentdivision ')
        + '| numlist listgroup '
        + '| linkfiles linkgroup '
        + '| '
        + (contentBlocksEnabled ? ' addcontentblock ' : '')
        + (source === 'false' ? '' : ' code ')
        + (advanced === 'false' ? '' : ' modeadvanced '),
      contextmenu: 'charmap hr' + (contentBlocksEnabled ? ' addcontentblock' : '')
    };
  }

  private static inline(contentBlocksEnabled: boolean, source: string, advanced: string, contentDivisions: string) {
    return {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + `| bold ${ItalicWithMore} `
        + '| h2 h3 hgroup '
        + '| '
        + (contentDivisions === 'false' ? '' : ' contentdivision ')
        + '| numlist listgroup '
        + '| linkgroup '
        + '| '
        + (contentBlocksEnabled ? ' addcontentblock ' : '')
        + (source === 'true' ? ' code ' : '')
        + (advanced === 'true' ? ' modeadvanced ' : '')
        + ' expandfulleditor ',
      contextmenu: 'charmap hr' + (contentBlocksEnabled ? ' addcontentblock' : '')
    };
  }
}
