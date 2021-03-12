import { Adam } from '../../../edit-types';
import { DnnBridgeConnectorParams, PagePickerResult } from '../../../edit/eav-material-controls/input-types/dnn-bridge/dnn-bridge.models';
import { FieldStringWysiwygEditor, wysiwygEditorTag } from '../editor/editor';
import { loadCustomIcons } from '../editor/load-icons.helper';
import { Guid } from '../shared/guid';
import { TinyType } from '../shared/models';

/** Register all kinds of buttons on TinyMce */
export class TinyMceButtons {

  static registerAll(fieldStringWysiwyg: FieldStringWysiwygEditor, editor: TinyType, adam: Adam) {
    const instSettings = fieldStringWysiwyg.configurator.addOnSettings;

    if (!instSettings.enabled) { return; }

    registerTinyMceFormats(editor, instSettings.imgSizes);

    loadCustomIcons(editor);

    TinyMceButtons.linkFiles(editor, adam);

    TinyMceButtons.linksGroups(editor, fieldStringWysiwyg);

    TinyMceButtons.images(editor, adam);

    TinyMceButtons.dropDownItalicAndMore(editor);

    TinyMceButtons.listButtons(editor);

    TinyMceButtons.switchModes(editor);

    TinyMceButtons.openDialog(editor, fieldStringWysiwyg.connector.dialog.open);

    TinyMceButtons.headingButtons(editor);

    TinyMceButtons.headingsGroup(editor);

    TinyMceButtons.contentBlock(editor);

    TinyMceButtons.imageContextMenu(editor, instSettings.imgSizes);

    TinyMceButtons.contextMenus(editor);
  }

  /** Group with adam-link, dnn-link */
  static linkFiles(editor: TinyType, adam: Adam) {
    editor.ui.registry.addSplitButton('linkfiles', {
      icon: 'custom-file-pdf',
      tooltip: 'Link.AdamFile.Tooltip',
      presets: 'listpreview',
      columns: 3,
      onAction: (_: TinyType) => {
        adam.toggle(false, false);
      },
      onItemAction: (api: TinyType, value: TinyType) => {
        value(api);
      },
      fetch: (callback: TinyType) => {
        const items = [
          {
            type: 'choiceitem',
            text: 'Link.AdamFile.Tooltip',
            tooltip: 'Link.AdamFile.Tooltip',
            icon: 'custom-file-pdf',
            value: (api: TinyType) => { adam.toggle(false, false); },
          },
          {
            type: 'choiceitem',
            text: 'Link.DnnFile.Tooltip',
            tooltip: 'Link.DnnFile.Tooltip',
            icon: 'custom-file-dnn',
            value: (api: TinyType) => { adam.toggle(true, false); },
          },
        ];
        callback(items);
      },
    });
  }

  /** Button groups for links (simple and pro) with web-link, page-link, unlink, anchor */
  static linksGroups(editor: TinyType, fieldStringWysiwyg: FieldStringWysiwygEditor) {
    const linkButton = editor.ui.registry.getAll().buttons.link;
    const linkgroupItems = [
      {
        ...linkButton,
        type: 'choiceitem',
        text: linkButton.tooltip,
        value: (api: TinyType) => { editor.execCommand('mceLink'); },
      },
      {
        type: 'choiceitem',
        text: 'Link.Page.Tooltip',
        tooltip: 'Link.Page.Tooltip',
        icon: 'custom-sitemap',
        value: (api: TinyType) => {
          const params: DnnBridgeConnectorParams = {
            CurrentValue: '',
            FileFilter: '',
            Paths: '',
          };
          fieldStringWysiwyg.connector._experimental.openPagePicker(params, (value: PagePickerResult) => {
            if (!value) { return; }
            fieldStringWysiwyg.connector._experimental.getUrlOfId('page:' + value.id, (path: string) => {
              const previouslySelected = editor.selection.getContent();
              editor.insertContent('<a href=\"' + path + '\">' + (previouslySelected || value.name) + '</a>');
            });
          });
        },
      },
    ];
    const linkgroupProItems = [...linkgroupItems];
    linkgroupProItems.push({
      type: 'choiceitem',
      text: 'Link.Anchor.Tooltip',
      tooltip: 'Link.Anchor.Tooltip',
      icon: 'custom-anchor',
      value: (api: TinyType) => { editor.execCommand('mceAnchor'); },
    });
    const linkgroup = {
      ...linkButton,
      presets: 'listpreview',
      columns: 3,
      onItemAction: (api: TinyType, value: TinyType) => {
        value(api);
      },
      fetch: (callback: TinyType) => {
        callback(linkgroupItems);
      },
    };
    const linkgroupPro = { ...linkgroup };
    linkgroupPro.fetch = (callback: TinyType) => {
      callback(linkgroupProItems);
    };
    editor.ui.registry.addSplitButton('linkgroup', linkgroup);
    editor.ui.registry.addSplitButton('linkgrouppro', linkgroupPro);
  }

  /** Images menu */
  static images(editor: TinyType, adam: Adam) {
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
      onAction: (_: TinyType) => {
        adam.toggle(false, true);
      },
      onItemAction: (api: TinyType, value: TinyType) => {
        value(api);
      },
      fetch: (callback: TinyType) => {
        const items = [
          {
            ...imageButton,
            type: 'choiceitem',
            text: 'Image.AdamImage.Tooltip',
            tooltip: 'Image.AdamImage.Tooltip',
            value: (api: TinyType) => { adam.toggle(false, true); },
          },
          {
            type: 'choiceitem',
            text: 'Image.DnnImage.Tooltip',
            tooltip: 'Image.DnnImage.Tooltip',
            icon: 'custom-image-dnn',
            value: (api: TinyType) => { adam.toggle(true, true); },
          },
          // note: all these use i18n from TinyMCE standard
          {
            ...imageButton,
            type: 'choiceitem',
            text: imageButton.tooltip,
            icon: 'link',
            value: (api: TinyType) => { editor.execCommand('mceImage'); },
          },
          {
            ...alignleftButton,
            type: 'choiceitem',
            text: alignleftButton.tooltip,
            value: (api: TinyType) => { editor.execCommand('JustifyLeft'); },
          },
          {
            ...aligncenterButton,
            type: 'choiceitem',
            text: aligncenterButton.tooltip,
            value: (api: TinyType) => { editor.execCommand('JustifyCenter'); },
          },
          {
            ...alignrightButton,
            type: 'choiceitem',
            text: alignrightButton.tooltip,
            value: (api: TinyType) => { editor.execCommand('JustifyRight'); },
          },
        ];
        callback(items);
      },
    });
  }

  /** Drop-down with italic, strikethrough, ... */
  static dropDownItalicAndMore(editor: TinyType) {
    const italicButton = editor.ui.registry.getAll().buttons.italic;
    const strikethroughButton = editor.ui.registry.getAll().buttons.strikethrough;
    const superscriptButton = editor.ui.registry.getAll().buttons.superscript;
    const subscriptButton = editor.ui.registry.getAll().buttons.subscript;
    editor.ui.registry.addSplitButton('formatgroup', {
      ...italicButton,
      presets: 'listpreview',
      columns: 3,
      onItemAction: (api: TinyType, value: TinyType) => {
        value(api);
      },
      fetch: (callback: TinyType) => {
        const items = [
          {
            ...strikethroughButton,
            type: 'choiceitem',
            text: strikethroughButton.tooltip,
            value: (api: TinyType) => { editor.execCommand('Strikethrough'); },
          },
          {
            ...superscriptButton,
            type: 'choiceitem',
            text: superscriptButton.tooltip,
            value: (api: TinyType) => { editor.execCommand('Superscript'); },
          },
          {
            ...subscriptButton,
            type: 'choiceitem',
            text: subscriptButton.tooltip,
            value: (api: TinyType) => { editor.execCommand('Subscript'); },
          },
        ];
        callback(items);
      },
    });
  }

  /** Lists / Indent / Outdent etc. */
  static listButtons(editor: TinyType) {
    const bullistButton = editor.ui.registry.getAll().buttons.bullist;
    const outdentButton = editor.ui.registry.getAll().buttons.outdent;
    const indentButton = editor.ui.registry.getAll().buttons.indent;
    // Drop-down with numbered list, bullet list, ...
    editor.ui.registry.addSplitButton('listgroup', {
      ...bullistButton,
      presets: 'listpreview',
      columns: 3,
      onItemAction: (api: TinyType, value: TinyType) => {
        value(api);
      },
      fetch: (callback: TinyType) => {
        const items = [
          {
            ...outdentButton,
            type: 'choiceitem',
            text: outdentButton.tooltip,
            value: (api: TinyType) => { editor.execCommand('Outdent'); },
          },
          {
            ...indentButton,
            type: 'choiceitem',
            text: indentButton.tooltip,
            value: (api: TinyType) => { editor.execCommand('Indent'); },
          },
        ];
        callback(items);
      },
    });
  }

  /** Switch normal / advanced mode */
  static switchModes(editor: TinyType) {
    editor.ui.registry.addButton('modestandard', {
      icon: 'close',
      tooltip: 'SwitchMode.Standard',
      onAction: (_: TinyType) => {
        switchModes('standard', editor);
      },
    });
    editor.ui.registry.addButton('modeinline', {
      icon: 'close',
      tooltip: 'SwitchMode.Standard',
      onAction: (_: TinyType) => {
        switchModes('inline', editor);
      },
    });
    editor.ui.registry.addButton('modeadvanced', {
      icon: 'custom-school',
      tooltip: 'SwitchMode.Pro',
      onAction: (_: TinyType) => {
        switchModes('advanced', editor);
      },
    });
  }

  /** Switch to Dialog Mode */
  static openDialog(editor: TinyType, open: (componentTag?: string) => void) {
    editor.ui.registry.addButton('expandfulleditor', {
      icon: 'browse',
      tooltip: 'SwitchMode.Expand',
      onAction: (_: TinyType) => {
        open(wysiwygEditorTag);
      },
    });
  }

  /** Headings Buttons */
  static headingButtons(editor: TinyType) {
    // h1, h2, etc. buttons, inspired by http://blog.ionelmc.ro/2013/10/17/tinymce-formatting-toolbar-buttons/
    // note that the complex array is needed because auto-translate only happens if the string is identical
    // custom p, H1-H6 only for the toolbar listpreview menu
    // [name, buttonCommand, tooltip, text, icon]
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
        onAction: (_: TinyType) => {
          editor.execCommand('mceToggleFormat', false, tag[1]);
        },
        onSetup: initOnPostRender(tag[0], editor),
      });
    });
  }

  /** Group of buttons with an h3 to start and showing h4-6 + p */
  static headingsGroup(editor: TinyType) {
    // FIXME: replace all following access to getall().buttons with the next buttons;
    // const buttons = editor.ui.registry.getAll().buttons;
    const blockquoteButton = editor.ui.registry.getAll().buttons.blockquote;
    editor.ui.registry.addSplitButton('hgroup', {
      ...editor.ui.registry.getAll().buttons.h4,
      presets: 'listpreview',
      columns: 4,
      onItemAction: (api: TinyType, value: TinyType) => {
        value(api);
      },
      fetch: (callback: TinyType) => {
        const items = [
          {
            ...editor.ui.registry.getAll().buttons.ch1,
            type: 'choiceitem',
            value: (api: TinyType) => { editor.execCommand('mceToggleFormat', false, 'h1'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.ch2,
            type: 'choiceitem',
            value: (api: TinyType) => { editor.execCommand('mceToggleFormat', false, 'h2'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.ch3,
            type: 'choiceitem',
            value: (api: TinyType) => { editor.execCommand('mceToggleFormat', false, 'h3'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.cp,
            type: 'choiceitem',
            value: (api: TinyType) => { editor.execCommand('mceToggleFormat', false, 'p'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.ch4,
            type: 'choiceitem',
            value: (api: TinyType) => { editor.execCommand('mceToggleFormat', false, 'h4'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.ch5,
            type: 'choiceitem',
            value: (api: TinyType) => { editor.execCommand('mceToggleFormat', false, 'h5'); },
          },
          {
            ...editor.ui.registry.getAll().buttons.ch6,
            type: 'choiceitem',
            value: (api: TinyType) => { editor.execCommand('mceToggleFormat', false, 'h6'); },
          },
          {
            ...blockquoteButton,
            type: 'choiceitem',
            text: blockquoteButton.tooltip,
            value: (api: TinyType) => { editor.execCommand('mceToggleFormat', false, 'blockquote'); },
          },
        ];
        callback(items);
      },
    });
  }

  /** Inside content (contentblocks) */
  static contentBlock(editor: TinyType) {
    editor.ui.registry.addButton('addcontentblock', {
      icon: 'custom-content-block',
      tooltip: 'ContentBlock.Add',
      onAction: (_: TinyType) => {
        const guid = Guid.uuid().toLowerCase(); // requires the uuid-generator to be included
        editor.insertContent(`<hr sxc="sxc-content-block" guid="${guid}" />`);
      },
    });
  }

  /** Image alignment / size buttons in context menu */
  static imageContextMenu(editor: TinyType, imgSizes: number[]) {
    // FIXME: replace all following access to addButtons with the next addButtons;
    // const reg = editor.ui.registry;
    editor.ui.registry.addButton('alignimgleft', {
      icon: 'align-left',
      tooltip: 'Align left',
      onAction: (_: TinyType) => {
        editor.execCommand('JustifyLeft');
      },
      onPostRender: initOnPostRender('alignleft', editor),
    });
    editor.ui.registry.addButton('alignimgcenter', {
      icon: 'align-center',
      tooltip: 'Align center',
      onAction: (_: TinyType) => {
        editor.execCommand('JustifyCenter');
      },
      onPostRender: initOnPostRender('aligncenter', editor),
    });
    editor.ui.registry.addButton('alignimgright', {
      icon: 'align-right',
      tooltip: 'Align right',
      onAction: (_: TinyType) => {
        editor.execCommand('JustifyRight');
      },
      onPostRender: initOnPostRender('alignright', editor),
    });
    const imgMenuArray: TinyType = [];
    for (const imgSize of imgSizes) {
      const config = {
        icon: 'resize',
        tooltip: `${imgSize}%`,
        text: `${imgSize}%`,
        value: (api: TinyType) => { editor.formatter.apply(`imgwidth${imgSize}`); },
        onAction: (_: TinyType) => {
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
      onAction: (_: TinyType) => {
        editor.formatter.apply('imgwidth100');
      },
      onPostRender: initOnPostRender('imgwidth100', editor),
    });
    // group of buttons to resize an image 100%, 50%, etc.
    editor.ui.registry.addSplitButton('imgresponsive', {
      ...editor.ui.registry.getAll().buttons.resizeimg100,
      onItemAction: (api: TinyType, value: TinyType) => {
        value(api);
      },
      fetch: (callback: TinyType) => {
        const items: TinyType = [];
        imgMenuArray.forEach((imgSizeOption: TinyType) => {
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
  static contextMenus(editor: TinyType) {
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
function initOnPostRender(name: TinyType, editor: TinyType) {
  return (buttonApi: TinyType) => {
    function watchChange() {
      editor.formatter.formatChanged(name, (state: TinyType) => {
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
function registerTinyMceFormats(editor: TinyType, imgSizes: number[]) {
  const imgformats: TinyType = {};
  for (const imgSize of imgSizes) {
    imgformats[`imgwidth${imgSize}`] = [{ selector: 'img', collapsed: false, styles: { width: `${imgSize}%` } }];
  }
  editor.formatter.register(imgformats);
}

// Mode switching and the buttons for it
function switchModes(mode: TinyType, editor: TinyType) {
  editor.settings.toolbar = editor.settings.modes[mode].toolbar;
  editor.settings.menubar = editor.settings.modes[mode].menubar;

  // refresh editor toolbar
  editor.editorManager.remove(editor);
  editor.editorManager.init(editor.settings);
}

// My context toolbars for links, images and lists (ul/li)
function makeTagDetector(tagWeNeedInTheTagPath: TinyType, editor: TinyType) {
  return function tagDetector(currentElement: TinyType) {
    // check if we are in a tag within a specific tag
    const selectorMatched = editor.dom.is(currentElement, tagWeNeedInTheTagPath) && editor.getBody().contains(currentElement);
    return selectorMatched;
  };
}
