export class TinyMceToolbars {

  static build(contentBlocksEnabled: boolean, inlineMode: boolean, buttonSource: string, buttonAdvanced: string) {
    const modes = {
      inline: TinyMceToolbars.inline(contentBlocksEnabled, buttonSource, buttonAdvanced),
      standard: TinyMceToolbars.standard(contentBlocksEnabled, buttonSource, buttonAdvanced),
      advanced: TinyMceToolbars.advanced(inlineMode, contentBlocksEnabled),
    };
    return {
      modes, // for later switch to another mode
      menubar: inlineMode ? modes.inline.menubar : modes.standard.menubar, // basic menu (none)
      toolbar: inlineMode ? modes.inline.toolbar : modes.standard.toolbar, // basic toolbar
      contextmenu: inlineMode ? modes.inline.contextmenu : modes.standard.contextmenu, // 'link image | charmap hr adamimage',
    };
  }

  private static advanced(inlineMode: boolean, contentBlocksEnabled: boolean) {
    return {
      menubar: true,
      toolbar: ' undo redo removeformat '
        + '| styleselect '
        + '| bold italic '
        + '| h2 h3 hgroup '
        + '| numlist bullist outdent indent '
        + '| ' + (!inlineMode ? ' images linkfiles' : '') + ' linkgrouppro '
        + '| '
        + (contentBlocksEnabled ? ' addcontentblock ' : '')
        + ' code '
        + (inlineMode ? ' modeinline expandfulleditor ' : ' modestandard '),
      contextmenu: 'link image | charmap hr adamimage' + (contentBlocksEnabled ? ' addcontentblock' : '')
    };
  }

  private static standard(contentBlocksEnabled: boolean, source: string, advanced: string) {
    return {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + '| bold formatgroup '
        + '| h2 h3 hgroup '
        + '| numlist listgroup '
        + '| linkfiles linkgroup '
        + '| '
        + (contentBlocksEnabled ? ' addcontentblock ' : '')
        + (source === 'false' ? '' : ' code ')
        + (advanced === 'false' ? '' : ' modeadvanced '),
      contextmenu: 'charmap hr' + (contentBlocksEnabled ? ' addcontentblock' : '')
    };
  }

  private static inline(contentBlocksEnabled: boolean, source: string, advanced: string) {
    return {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + '| bold formatgroup '
        + '| h2 h3 hgroup '
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
