import { loadCustomIcons } from '../editor/load-icons.helper';
import { Guid } from '../shared/guid';
import { FieldStringWysiwygEditor, wysiwygEditorTag } from '../editor/editor';
import { webpackConsoleLog } from '../../../shared/webpack-console-log.helper';
// tslint:disable: curly

/** Register all kinds of buttons on TinyMce */
export class TinyMceButtons {

  static registerAll(fieldStringWysiwyg: FieldStringWysiwygEditor, editor: any) {
    const instSettings = fieldStringWysiwyg.configurator.addOnSettings;

    if (!instSettings.enabled) return;

    registerTinyMceFormats(editor, instSettings.imgSizes);

    loadCustomIcons(editor);

    TinyMceButtons.linkFiles(editor, fieldStringWysiwyg);

    TinyMceButtons.linksGroups(editor, fieldStringWysiwyg);

    TinyMceButtons.images(editor, fieldStringWysiwyg);

    TinyMceButtons.dropDownItalicAndMore(editor);

    TinyMceButtons.listButtons(editor);

    TinyMceButtons.switchModes(editor);

    TinyMceButtons.openDialog(editor, fieldStringWysiwyg.connector.dialog.open);

    TinyMceButtons.headingButtons(editor);

    webpackConsoleLog('buttons', editor.ui.registry.getAll());
    TinyMceButtons.headingsGroup(editor);

    TinyMceButtons.contentBlock(editor);

    TinyMceButtons.imageContextMenu(editor, instSettings.imgSizes);

    TinyMceButtons.contextMenus(editor);
  }

  /** Group with adam-link, dnn-link */
  // TODO: SPM this should be typed, and then it should be .adam.toggle
  static linkFiles(editor: any, fieldStringWysiwyg: any) {
    editor.ui.registry.addSplitButton('linkfiles', {
      icon: 'custom-file-pdf',
      tooltip: 'Link.AdamFile.Tooltip',
      presets: 'listpreview',
      columns: 3,
      onAction: (_: any) => {
        fieldStringWysiwyg.toggleAdam(false);
      },
      onItemAction: (api: any, value: any) => {
        value(api);
      },
      fetch: (callback: any) => {
        const items = [
          {
            type: 'choiceitem',
            text: 'Link.AdamFile.Tooltip',
            tooltip: 'Link.AdamFile.Tooltip',
            icon: 'custom-file-pdf',
            value: (api: any) => { fieldStringWysiwyg.toggleAdam(false); },
          },
          {
            type: 'choiceitem',
            text: 'Link.DnnFile.Tooltip',
            tooltip: 'Link.DnnFile.Tooltip',
            icon: 'custom-file-dnn',
            value: (api: any) => { fieldStringWysiwyg.toggleAdam(false, true); },
          },
        ];
        callback(items);
      },
    });
  }

  /** Button groups for links (simple and pro) with web-link, page-link, unlink, anchor */
  // TODO: SPM this should be typed, and then it should be .adam.toggle
  static linksGroups(editor: any, fieldStringWysiwyg: any) {
    const linkButton = editor.ui.registry.getAll().buttons.link;
    const linkgroupItems = [
      {
        ...linkButton,
        type: 'choiceitem',
        text: linkButton.tooltip,
        value: (api: any) => { editor.execCommand('mceLink'); },
      },
      {
        type: 'choiceitem',
        text: 'Link.Page.Tooltip',
        tooltip: 'Link.Page.Tooltip',
        icon: 'custom-sitemap',
        value: (api: any) => { fieldStringWysiwyg.openDnnDialog('pagepicker'); },
      },
    ];
    const linkgroupProItems = [...linkgroupItems];
    linkgroupProItems.push({
      type: 'choiceitem',
      text: 'Link.Anchor.Tooltip',
      tooltip: 'Link.Anchor.Tooltip',
      icon: 'custom-anchor',
      value: (api: any) => { editor.execCommand('mceAnchor'); },
    });
    const linkgroup = {
      ...linkButton,
      presets: 'listpreview',
      columns: 3,
      onItemAction: (api: any, value: any) => {
        value(api);
      },
      fetch: (callback: any) => {
        callback(linkgroupItems);
      },
    };
    const linkgroupPro = { ...linkgroup };
    linkgroupPro.fetch = (callback: any) => {
      callback(linkgroupProItems);
    };
    editor.ui.registry.addSplitButton('linkgroup', linkgroup);
    editor.ui.registry.addSplitButton('linkgrouppro', linkgroupPro);
  }

  /** Images menu */
  static images(editor: any, fieldStringWysiwyg: any) {
    const imageButton = editor.ui.registry.getAll().buttons.image;
    const alignleftButton = editor.ui.registry.getAll().buttons.alignleft;
    const aligncenterButton = editor.ui.registry.getAll().buttons.aligncenter;
    const alignrightButton = editor.ui.registry.getAll().buttons.alignright;
    // Group with images (adam) - only in PRO mode
    editor.ui.registry.addSplitButton('images', {
      ...imageButton,
      tooltip: 'Image.AdamImage.Tooltip',
      presets: 'listpreview',
      columns: 3,
      onAction: (_: any) => {
        fieldStringWysiwyg.toggleAdam(true);
      },
      onItemAction: (api: any, value: any) => {
        value(api);
      },
      fetch: (callback: any) => {
        const items = [
          {
            ...imageButton,
            type: 'choiceitem',
            text: 'Image.AdamImage.Tooltip',
            tooltip: 'Image.AdamImage.Tooltip',
            value: (api: any) => { fieldStringWysiwyg.toggleAdam(true); },
          },
          {
            type: 'choiceitem',
            text: 'Image.DnnImage.Tooltip',
            tooltip: 'Image.DnnImage.Tooltip',
            icon: 'custom-image-dnn',
            value: (api: any) => { fieldStringWysiwyg.toggleAdam(true, true); },
          },
          // note: all these use i18n from tinyMce standard
          {
            ...imageButton,
            type: 'choiceitem',
            text: imageButton.tooltip,
            icon: 'link',
            value: (api: any) => { editor.execCommand('mceImage'); },
          },
          {
            ...alignleftButton,
            type: 'choiceitem',
            text: alignleftButton.tooltip,
            value: (api: any) => { editor.execCommand('JustifyLeft'); },
          },
          {
            ...aligncenterButton,
            type: 'choiceitem',
            text: aligncenterButton.tooltip,
            value: (api: any) => { editor.execCommand('JustifyCenter'); },
          },
          {
            ...alignrightButton,
            type: 'choiceitem',
            text: alignrightButton.tooltip,
            value: (api: any) => { editor.execCommand('JustifyRight'); },
          },
        ];
        callback(items);
      },
    });
  }

  /** Drop-down with italic, strikethrough, ... */
  static dropDownItalicAndMore(editor: any) {
    const italicButton = editor.ui.registry.getAll().buttons.italic;
    const strikethroughButton = editor.ui.registry.getAll().buttons.strikethrough;
    const superscriptButton = editor.ui.registry.getAll().buttons.superscript;
    const subscriptButton = editor.ui.registry.getAll().buttons.subscript;
    editor.ui.registry.addSplitButton('formatgroup', {
      ...italicButton,
      presets: 'listpreview',
      columns: 3,
      onItemAction: (api: any, value: any) => {
        value(api);
      },
      fetch: (callback: any) => {
        const items = [
          {
            ...strikethroughButton,
            type: 'choiceitem',
            text: strikethroughButton.tooltip,
            value: (api: any) => { editor.execCommand('Strikethrough'); },
          },
          {
            ...superscriptButton,
            type: 'choiceitem',
            text: superscriptButton.tooltip,
            value: (api: any) => { editor.execCommand('Superscript'); },
          },
          {
            ...subscriptButton,
            type: 'choiceitem',
            text: subscriptButton.tooltip,
            value: (api: any) => { editor.execCommand('Subscript'); },
          },
        ];
        callback(items);
      },
    });
  }

  /** Lists / Indent / Outdent etc. */
  static listButtons(editor: any) {
    const bullistButton = editor.ui.registry.getAll().buttons.bullist;
    const outdentButton = editor.ui.registry.getAll().buttons.outdent;
    const indentButton = editor.ui.registry.getAll().buttons.indent;
    // Drop-down with numbered list, bullet list, ...
    editor.ui.registry.addSplitButton('listgroup', {
      ...bullistButton,
      presets: 'listpreview',
      columns: 3,
      onItemAction: (api: any, value: any) => {
        value(api);
      },
      fetch: (callback: any) => {
        const items = [
          {
            ...outdentButton,
            type: 'choiceitem',
            text: outdentButton.tooltip,
            value: (api: any) => { editor.execCommand('Outdent'); },
          },
          {
            ...indentButton,
            type: 'choiceitem',
            text: indentButton.tooltip,
            value: (api: any) => { editor.execCommand('Indent'); },
          },
        ];
        callback(items);
      },
    });
  }

  /** Switch normal / advanced mode */
  static switchModes(editor: any) {
    editor.ui.registry.addButton('modestandard', {
      icon: 'close',
      tooltip: 'SwitchMode.Standard',
      onAction: (_: any) => {
        switchModes('standard', editor);
      },
    });
    editor.ui.registry.addButton('modeinline', {
      icon: 'close',
      tooltip: 'SwitchMode.Standard',
      onAction: (_: any) => {
        switchModes('inline', editor);
      },
    });
    editor.ui.registry.addButton('modeadvanced', {
      icon: 'custom-school',
      tooltip: 'SwitchMode.Pro',
      onAction: (_: any) => {
        switchModes('advanced', editor);
      },
    });
  }

  /** Switch to Dialog Mode */
  static openDialog(editor: any, open: (componentTag?: string) => void) {
    editor.ui.registry.addButton('expandfulleditor', {
      icon: 'browse',
      tooltip: 'SwitchMode.Expand',
      onAction: (_: any) => {
        open(wysiwygEditorTag);
      },
    });
  }

  /** Headings Buttons */
  static headingButtons(editor: any) {
    // h1, h2, etc. buttons, inspired by http://blog.ionelmc.ro/2013/10/17/tinymce-formatting-toolbar-buttons/
    // note that the complex array is needed because auto-translate only happens if the string is identical
    /*
      custom p, H1-H6 only for the toolbar listpreview menu
      [name, buttonCommand, tooltip, text, icon]
    */
    const isGerman = editor.settings.language === 'de';
    [['pre', 'Preformatted', 'Preformatted'],
    ['cp', 'p', 'Paragraph', 'Paragraph', 'custom-paragraph'],
    // ['code', 'Code', 'Code'],
    ['ch1', 'h1', 'Heading 1', 'H1', isGerman ? 'custom-image-u1' : 'custom-image-h1'],
    ['ch2', 'h2', 'Heading 2', 'H2', isGerman ? 'custom-image-u2' : 'custom-image-h2'],
    ['ch3', 'h3', 'Heading 3', 'H3', isGerman ? 'custom-image-u3' : 'custom-image-h3'],
    ['ch4', 'h4', 'Heading 4', 'H4', isGerman ? 'custom-image-u4' : 'custom-image-h4'],
    ['ch5', 'h5', 'Heading 5', 'H5', isGerman ? 'custom-image-u5' : 'custom-image-h5'],
    ['ch6', 'h6', 'Heading 6', 'H6', isGerman ? 'custom-image-u6' : 'custom-image-h6']].forEach((tag) => {
      editor.ui.registry.addButton(tag[0], {
        icon: tag[4],
        tooltip: tag[2],
        text: tag[2],
        onAction: (_: any) => {
          editor.execCommand('mceToggleFormat', false, tag[1]);
        },
        onSetup: initOnPostRender(tag[0], editor),
      });
    });
  }

  /** Group of buttons with an h3 to start and showing h4-6 + p */
  static headingsGroup(editor: any) {
    const blockquoteButton = editor.ui.registry.getAll().buttons.blockquote;
    editor.ui.registry.addSplitButton('hgroup', {
      ...editor.ui.registry.getAll().buttons.h4,
      presets: 'listpreview',
      columns: 4,
      onItemAction: (api: any, value: any) => {
        value(api);
      },
      fetch: (callback: any) => {
        const items = [
          {
            ...editor.ui.registry.getAll().buttons.ch1,
            type: 'choiceitem',
            value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'h1'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.ch2,
            type: 'choiceitem',
            value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'h2'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.ch3,
            type: 'choiceitem',
            value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'h3'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.cp,
            type: 'choiceitem',
            value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'p'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.ch4,
            type: 'choiceitem',
            value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'h4'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.ch5,
            type: 'choiceitem',
            value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'h5'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.ch6,
            type: 'choiceitem',
            value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'h6'); },
          },
          {
            ...blockquoteButton,
            type: 'choiceitem',
            text: blockquoteButton.tooltip,
            value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'blockquote'); },
          },
        ];
        callback(items);
      },
    });
  }

  /** Inside content (contentblocks) */
  static contentBlock(editor: any) {
    editor.ui.registry.addButton('addcontentblock', {
      icon: 'custom-content-block',
      tooltip: 'ContentBlock.Add',
      onAction: (_: any) => {
        const guid = Guid.uuid().toLowerCase(); // requires the uuid-generator to be included
        editor.insertContent(`<hr sxc="sxc-content-block" guid="${guid}" />`);
      },
    });
  }

  /** Image alignment / size buttons in context menu */
  static imageContextMenu(editor: any, imgSizes: number[]) {
    editor.ui.registry.addButton('alignimgleft', {
      icon: 'align-left',
      tooltip: 'Align left',
      onAction: (_: any) => {
        editor.execCommand('JustifyLeft');
      },
      onPostRender: initOnPostRender('alignleft', editor),
    });
    editor.ui.registry.addButton('alignimgcenter', {
      icon: 'align-center',
      tooltip: 'Align center',
      onAction: (_: any) => {
        editor.execCommand('JustifyCenter');
      },
      onPostRender: initOnPostRender('aligncenter', editor),
    });
    editor.ui.registry.addButton('alignimgright', {
      icon: 'align-right',
      tooltip: 'Align right',
      onAction: (_: any) => {
        editor.execCommand('JustifyRight');
      },
      onPostRender: initOnPostRender('alignright', editor),
    });
    const imgMenuArray: any = [];
    for (const imgSize of imgSizes) {
      const config = {
        icon: 'resize',
        tooltip: `${imgSize}%`,
        text: `${imgSize}%`,
        value: (api: any) => { editor.formatter.apply(`imgwidth${imgSize}`); },
        onAction: (_: any) => {
          editor.formatter.apply(`imgwidth${imgSize}`);
        },
        onPostRender: initOnPostRender(`imgwidth${imgSize}`, editor),
      };
      editor.ui.registry.addButton(`imgresize${imgSize}`, config);
      imgMenuArray.push(config);
    }
    editor.ui.registry.addButton('resizeimg100', {
      icon: 'resize',
      tooltip: '100%',
      onAction: (_: any) => {
        editor.formatter.apply('imgwidth100');
      },
      onPostRender: initOnPostRender('imgwidth100', editor),
    });
    // group of buttons to resize an image 100%, 50%, etc.
    editor.ui.registry.addSplitButton('imgresponsive', {
      ...editor.ui.registry.getAll().buttons.resizeimg100,
      onItemAction: (api: any, value: any) => {
        value(api);
      },
      fetch: (callback: any) => {
        const items: any = [];
        imgMenuArray.forEach((imgSizeOption: any) => {
          items.push({
            ...imgSizeOption,
            type: 'choiceitem',
          });
        });
        callback(items);
      },
    });
  }

  /** Add Context toolbars */
  static contextMenus(editor: any) {
    editor.ui.registry.addContextToolbar('a', {
      predicate: makeTagDetector('a', editor),
      items: 'link unlink',
    });
    editor.ui.registry.addContextToolbar('img', {
      predicate: makeTagDetector('img', editor),
      items: 'image | alignimgleft alignimgcenter alignimgright imgresponsive | removeformat | remove',
    });
    editor.ui.registry.addContextToolbar('li,ol,ul', {
      predicate: makeTagDetector('li,ol,ul', editor),
      items: 'numlist bullist | outdent indent',
    });
  }
}

/**
 * Helper function to add activate/deactivate to buttons like alignleft, alignright etc.
 * copied/modified from
 * https://github.com/tinymce/tinymce/blob/ddfa0366fc700334f67b2c57f8c6e290abf0b222/js/tinymce/classes/ui/FormatControls.js#L232-L249
 */
function initOnPostRender(name: any, editor: any) {
  return (buttonApi: any) => {
    function watchChange() {
      editor.formatter.formatChanged(name, (state: any) => {
        try {
          buttonApi.setActive(state);
        } catch (error) {
          // cannot be set active when not visible on toolbar and is behind More... button
          // console.error('button set active error:', error);
        }
      });
    }

    if (editor.formatter) {
      watchChange();
    } else {
      editor.on('init', watchChange);
    }
  };
}

/** Register all formats - like img-sizes */
function registerTinyMceFormats(editor: any, imgSizes: number[]) {
  const imgformats: any = {};
  for (const imgSize of imgSizes) {
    imgformats[`imgwidth${imgSize}`] = [{ selector: 'img', collapsed: false, styles: { width: `${imgSize}%` } }];
  }
  editor.formatter.register(imgformats);
}

// Mode switching and the buttons for it
function switchModes(mode: any, editor: any) {
  editor.settings.toolbar = editor.settings.modes[mode].toolbar;
  editor.settings.menubar = editor.settings.modes[mode].menubar;

  // refresh editor toolbar
  editor.editorManager.remove(editor);
  editor.editorManager.init(editor.settings);
}

// My context toolbars for links, images and lists (ul/li)
function makeTagDetector(tagWeNeedInTheTagPath: any, editor: any) {
  return function tagDetector(currentElement: any) {
    // check if we are in a tag within a specific tag
    const selectorMatched = editor.dom.is(currentElement, tagWeNeedInTheTagPath) && editor.getBody().contains(currentElement);
    return selectorMatched;
  };
}
