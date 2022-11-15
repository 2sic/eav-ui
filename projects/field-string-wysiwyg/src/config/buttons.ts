import type { Editor, RawEditorOptions } from 'tinymce';
import { Adam } from '../../../edit-types';
import { FieldStringWysiwygEditor, wysiwygEditorTag } from '../editor/editor';
import { loadCustomIcons } from '../editor/load-icons.helper';
import { Guid } from '../shared/guid';
import { ImageFormats } from '../shared/models';

// Export Constant names because these will become standardized
// So people can use them in their custom toolbars
export const ItalicWithMore = 'italic-more'; // used to be 'formatgroup'
export const SxcImages = 'images-cms'; // used to be 'images'

// TODO: @SDV - move all names which are used elsewhele - like button names etc.
// to exports above, and use these in the toolbars.ts
// so I can rename then later on before publishing
// As the names will have to become public terms so I must control them exactly

type FuncVoid = () => void | unknown;

/** Register all kinds of buttons on TinyMCE */
export class TinyMceButtons {

  // TODO: @SDV - CHANGE THIS CLASS
  // to use these values from the object, and remove all params from registerAll()
  constructor(private field: FieldStringWysiwygEditor, private editor: Editor, private adam: Adam, private options: RawEditorOptions) {

  }

  registerAll(fieldStringWysiwyg: FieldStringWysiwygEditor, editor: Editor, adam: Adam, rawEditorOptions: RawEditorOptions): void {
    const instSettings = fieldStringWysiwyg.configurator.addOnSettings;

    if (!instSettings.enabled) { return; }

    registerTinyMceFormats(editor, instSettings.imgSizes);

    loadCustomIcons(editor);

    // @SDV - example what to change
    // before: this.linkFiles(editor, adam);
    this.linkFiles();

    this.linksGroups(editor, fieldStringWysiwyg);

    // this.images(editor, adam);
    this.images();

    this.dropDownItalicAndMore(editor);

    this.listButtons(editor);

    this.switchModes(editor, rawEditorOptions);

    this.openDialog(editor, fieldStringWysiwyg);

    this.headingsGroup(editor);

    this.contentBlock(editor);

    this.contentDivision(editor);

    this.imageContextMenu(editor, instSettings.imgSizes);

    this.contextMenus(editor);
  }

  /** Inner call for most onItemAction commands */
  private runOrExecCommand(api: unknown, value: unknown) {
    // If it's a function, call it with params (the params are usually not used)
    if (typeof(value) === 'function') value(api, value);

    // If it's a string, it must be a command the editor knows
    if (typeof(value) === 'string') this.editor.execCommand(value);
  }

  /** Create a common default structure for most SplitButtonSpecs */
  private splitButtonSpecs(initialCommand: string | FuncVoid) {

    return {
      onAction: (api: unknown) => {
        this.runOrExecCommand(api, initialCommand);
      },

      onItemAction: (api: unknown, value: unknown) => {
        this.runOrExecCommand(api, value);
      },
    };
  }

  /**
   * Compact way to create a SplitButtonChoiceItem
   * @param icon The icon
   * @param text The label
   * @param action In basic cases it's just a string - the name of the command, or the method
   */
  private splitButtonItem(icon: string, text: string, action: string | FuncVoid) {
    return { icon, text, type: 'choiceitem' as 'choiceitem', value: action as string }; // pretend action is as string
  }

  /** Group with adam-link, dnn-link */
  private linkFiles(): void {
    const adam = this.adam;
    this.editor.ui.registry.addSplitButton('linkfiles', {
      // TODO @SDV - example with function
      ...this.splitButtonSpecs(() => adam.toggle(false, false)),
      columns: 3,
      icon: 'custom-file-pdf',
      presets: 'listpreview',
      tooltip: 'Link.AdamFile.Tooltip',
      // onAction: (api) => {
      //   adam.toggle(false, false);
      // },
      // onItemAction: (api, value: any) => {
      //   value();
      // },
      fetch: (callback) => {
        callback([
          // TODO @SDV - example with function
          this.splitButtonItem('custom-file-pdf', 'Link.AdamFile.Tooltip', () => adam.toggle(false, false)),
          this.splitButtonItem('custom-file-dnn', 'Link.DnnFile.Tooltip', () => adam.toggle(true, false)),
          // {
          //   icon: 'custom-file-pdf',
          //   text: 'Link.AdamFile.Tooltip',
          //   type: 'choiceitem',
          //   value: (() => { adam.toggle(false, false); }) as any,
          // },
          // {
          //   icon: 'custom-file-dnn',
          //   text: 'Link.DnnFile.Tooltip',
          //   type: 'choiceitem',
          //   value: (() => { adam.toggle(true, false); }) as any,
          // },
        ]);
      },
    });
  }

  /** Button groups for links (simple and pro) with web-link, page-link, unlink, anchor */
  private linksGroups(editor: Editor, fieldStringWysiwyg: FieldStringWysiwygEditor): void {
    this.addLinkGroup(editor, fieldStringWysiwyg, false);
    this.addLinkGroup(editor, fieldStringWysiwyg, true);
  }

  private addLinkGroup(editor: Editor, fieldStringWysiwyg: FieldStringWysiwygEditor, isPro: boolean): void {
    const linkButton = editor.ui.registry.getAll().buttons.link;

    editor.ui.registry.addSplitButton(!isPro ? 'linkgroup' : 'linkgrouppro', {
      columns: 3,
      icon: linkButton.icon,
      presets: 'listpreview',
      tooltip: linkButton.tooltip,
      onAction: (api) => {
        editor.execCommand('mceLink');
      },
      onItemAction: (api, value: any) => {
        value();
      },
      fetch: (callback) => {
        callback([
          {
            icon: linkButton.icon,
            text: linkButton.tooltip,
            type: 'choiceitem',
            value: (() => { editor.execCommand('mceLink'); }) as any,
          },
          {
            icon: 'custom-sitemap',
            text: 'Link.Page.Tooltip',
            type: 'choiceitem',
            value: (() => { openPagePicker(editor, fieldStringWysiwyg); }) as any,
          },
          ...(!isPro ? [] : [{
            icon: 'custom-anchor',
            text: 'Link.Anchor.Tooltip',
            type: 'choiceitem' as 'choiceitem',
            value: (() => { editor.execCommand('mceAnchor'); }) as any,
          }]),
        ]);
      },
    });
  }

  /** Images menu */
  private images(): void {
    const adam = this.adam;
    const editor = this.editor;
    const buttons = this.editor.ui.registry.getAll().buttons;
    const imageButton = buttons.image;
    const linkButton = buttons.link;
    const alignleftButton = buttons.alignleft;
    const aligncenterButton = buttons.aligncenter;
    const alignrightButton = buttons.alignright;

    // Group with images (adam) - only in PRO mode
    this.editor.ui.registry.addSplitButton(SxcImages, {
      ...this.splitButtonSpecs(() => adam.toggle(false, true)),
      columns: 3,
      icon: imageButton.icon,
      presets: 'listpreview',
      tooltip: 'Image.AdamImage.Tooltip',
      // onAction: (api) => {
      //   adam.toggle(false, true);
      // },
      // onItemAction: (api, value: any) => {
      //   value();
      // },
      fetch: (callback) => {
        callback([
          {
            icon: imageButton.icon,
            text: 'Image.AdamImage.Tooltip',
            type: 'choiceitem',
            value: (() => { adam.toggle(false, true); }) as any,
          },
          {
            icon: 'custom-image-dnn',
            text: 'Image.DnnImage.Tooltip',
            type: 'choiceitem',
            value: (() => { adam.toggle(true, true); }) as any,
          },
          {
            icon: linkButton.icon,
            text: imageButton.tooltip,
            type: 'choiceitem',
            value: (() => { editor.execCommand('mceImage'); }) as any,
          },
          {
            icon: alignleftButton.icon,
            text: alignleftButton.tooltip,
            type: 'choiceitem',
            value: (() => { editor.execCommand('JustifyLeft'); }) as any,
          },
          {
            icon: aligncenterButton.icon,
            text: aligncenterButton.tooltip,
            type: 'choiceitem',
            value: (() => { editor.execCommand('JustifyCenter'); }) as any,
          },
          {
            icon: alignrightButton.icon,
            text: alignrightButton.tooltip,
            type: 'choiceitem',
            value: (() => { editor.execCommand('JustifyRight'); }) as any,
          },
        ]);
      },
    });
  }

  /** Drop-down with italic, strikethrough, ... */
  private dropDownItalicAndMore(editor: Editor): void {
    const buttons = editor.ui.registry.getAll().buttons;
    const italicButton = buttons.italic;
    // const strikethroughButton = buttons.strikethrough;
    const superscriptButton = buttons.superscript;
    const subscriptButton = buttons.subscript;

    editor.ui.registry.addSplitButton(ItalicWithMore, {
      // TODO: @SDV use this...
      ...this.splitButtonSpecs('Italic'),
      columns: 3,
      icon: italicButton.icon,
      presets: 'listpreview',
      tooltip: italicButton.tooltip,
      // @STV ...instead of this
      // onAction: (api) => {
      //   editor.execCommand('Italic');
      // },
      // onItemAction: (api, value: any) => {
      //   value();
      // },
      fetch: (callback) => {
        callback([
          // TODO: @SDV - use this instead of below
          this.splitButtonItem(buttons.strikethrough.icon, buttons.strikethrough.tooltip, 'Strikethrough'),
          // {
          //   icon: strikethroughButton.icon,
          //   text: strikethroughButton.tooltip,
          //   type: 'choiceitem',
          //   value: (() => { editor.execCommand('Strikethrough'); }) as any,
          // },
          {
            icon: superscriptButton.icon,
            text: superscriptButton.tooltip,
            type: 'choiceitem',
            value: (() => { editor.execCommand('Superscript'); }) as any,
          },
          {
            icon: subscriptButton.icon,
            text: subscriptButton.tooltip,
            type: 'choiceitem',
            value: (() => { editor.execCommand('Subscript'); }) as any,
          },
        ]);
      },
    });
  }

  /** Lists / Indent / Outdent etc. */
  private listButtons(editor: Editor): void {
    const buttons = editor.ui.registry.getAll().buttons;
    const bullistButton = buttons.bullist;
    const outdentButton = buttons.outdent;
    const indentButton = buttons.indent;

    // Drop-down with numbered list, bullet list, ...
    editor.ui.registry.addSplitButton('listgroup', {
      columns: 3,
      icon: bullistButton.icon,
      presets: 'listpreview',
      tooltip: bullistButton.tooltip,
      onAction: (api) => {
        editor.execCommand('InsertUnorderedList');
      },
      onItemAction: (api, value: any) => {
        value();
      },
      fetch: (callback) => {
        callback([
          {
            icon: outdentButton.icon,
            text: outdentButton.tooltip,
            type: 'choiceitem',
            value: (() => { editor.execCommand('Outdent'); }) as any,
          },
          {
            icon: indentButton.icon,
            text: indentButton.tooltip,
            type: 'choiceitem',
            value: (() => { editor.execCommand('Indent'); }) as any,
          },
        ]);
      },
    });
  }

  /** Switch normal / advanced mode */
  private switchModes(editor: Editor, rawEditorOptions: RawEditorOptions): void {
    editor.ui.registry.addButton('modestandard', {
      icon: 'close',
      tooltip: 'SwitchMode.Standard',
      onAction: (api) => {
        switchModes('standard', editor, rawEditorOptions);
      },
    });
    editor.ui.registry.addButton('modeinline', {
      icon: 'close',
      tooltip: 'SwitchMode.Standard',
      onAction: (api) => {
        switchModes('inline', editor, rawEditorOptions);
      },
    });
    editor.ui.registry.addButton('modeadvanced', {
      icon: 'custom-school',
      tooltip: 'SwitchMode.Pro',
      onAction: (api) => {
        switchModes('advanced', editor, rawEditorOptions);
      },
    });
  }

  /** Switch to Dialog Mode */
  private openDialog(editor: Editor, fieldStringWysiwyg: FieldStringWysiwygEditor): void {
    editor.ui.registry.addButton('expandfulleditor', {
      icon: 'browse',
      tooltip: 'SwitchMode.Expand',
      onAction: (api) => {
        // fixes bug where toolbar drawer is shown above full mode tinymce
        const toolbarDrawerOpen = editor.queryCommandState('ToggleToolbarDrawer');
        if (toolbarDrawerOpen) {
          editor.execCommand('ToggleToolbarDrawer');
        }
        fieldStringWysiwyg.connector.dialog.open(wysiwygEditorTag);
      },
    });
  }

  /** Group of buttons with an h3 to start and showing h4-6 + p */
  private headingsGroup(editor: Editor): void {
    const isGerman = editor.options.get('language') === 'de';
    const buttons = editor.ui.registry.getAll().buttons;

    const h1Button = buttons.h1;
    const h2Button = buttons.h2;
    const h3Button = buttons.h3;
    const h4Button = buttons.h4;
    const h5Button = buttons.h5;
    const h6Button = buttons.h6;
    const blockquoteButton = buttons.blockquote;

    editor.ui.registry.addSplitButton('hgroup', {
      columns: 4,
      presets: 'listpreview',
      text: h4Button.text,
      tooltip: h4Button.tooltip,
      onAction: (api) => {
        editor.execCommand('mceToggleFormat', false, 'h4');
      },
      onItemAction: (api, value: any) => {
        value();
      },
      fetch: (callback) => {
        callback([
          {
            icon: !isGerman ? 'custom-image-h1' : 'custom-image-u1',
            text: h1Button.text,
            type: 'choiceitem',
            value: (() => { editor.execCommand('mceToggleFormat', false, 'h1'); }) as any,
          },
          {
            icon: !isGerman ? 'custom-image-h2' : 'custom-image-u2',
            text: h2Button.text,
            type: 'choiceitem',
            value: (() => { editor.execCommand('mceToggleFormat', false, 'h2'); }) as any,
          },
          {
            icon: !isGerman ? 'custom-image-h3' : 'custom-image-u3',
            text: h3Button.text,
            type: 'choiceitem',
            value: (() => { editor.execCommand('mceToggleFormat', false, 'h3'); }) as any,
          },
          {
            icon: 'custom-paragraph',
            text: 'Paragraph',
            type: 'choiceitem',
            value: (() => { editor.execCommand('mceToggleFormat', false, 'p'); }) as any,
          },
          {
            icon: !isGerman ? 'custom-image-h4' : 'custom-image-u4',
            text: h4Button.text,
            type: 'choiceitem',
            value: (() => { editor.execCommand('mceToggleFormat', false, 'h4'); }) as any,
          },
          {
            icon: !isGerman ? 'custom-image-h5' : 'custom-image-u5',
            text: h5Button.text,
            type: 'choiceitem',
            value: (() => { editor.execCommand('mceToggleFormat', false, 'h5'); }) as any,
          },
          {
            icon: !isGerman ? 'custom-image-h6' : 'custom-image-u6',
            text: h6Button.text,
            type: 'choiceitem',
            value: (() => { editor.execCommand('mceToggleFormat', false, 'h6'); }) as any,
          },
          {
            icon: blockquoteButton.icon,
            text: blockquoteButton.tooltip,
            type: 'choiceitem',
            value: (() => { editor.execCommand('mceToggleFormat', false, 'blockquote'); }) as any,
          },
        ]);
      },
    });
  }

  /** Inside content (contentblocks) */
  private contentBlock(editor: Editor): void {
    editor.ui.registry.addButton('addcontentblock', {
      icon: 'custom-content-block',
      tooltip: 'ContentBlock.Add',
      onAction: (api) => {
        const guid = Guid.uuid().toLowerCase();
        editor.insertContent(`<hr sxc="sxc-content-block" guid="${guid}" />`);
      },
    });
  }

  /** Inside content (contentdivision) */
  private contentDivision(editor: Editor): void {
    editor.ui.registry.addButton('contentdivision', {
      icon: 'custom-branding-watermark',
      tooltip: 'ContentDivision.Add',
      onAction: (api) => {
        editor.insertContent(`<div class="content-division"></div>`);
      },
    });
  }

  /** Image alignment / size buttons in context menu */
  private imageContextMenu(editor: Editor, imgSizes: number[]): void {
    editor.ui.registry.addSplitButton('imgresponsive', {
      icon: 'resize',
      tooltip: '100%',
      onAction: (api) => {
        editor.formatter.apply('imgwidth100');
      },
      onItemAction: (api, value: any) => {
        value();
      },
      fetch: (callback) => {
        callback(
          // WARNING! This part is not fully type safe
          imgSizes.map(imgSize => ({
            icon: 'resize',
            text: `${imgSize}%`,
            type: 'choiceitem',
            value: (() => { editor.formatter.apply(`imgwidth${imgSize}`); }) as any,
          })),
        );
      },
    });
  }

  /** Add Context toolbars */
  private contextMenus(editor: Editor): void {
    const rangeSelected = () => document.getSelection().rangeCount > 0 && !document.getSelection().getRangeAt(0).collapsed;

    editor.ui.registry.addContextToolbar('linkContextToolbar', {
      items: 'link unlink',
      predicate: (elem) => elem.nodeName.toLocaleLowerCase() === 'a' && rangeSelected(),
    });
    editor.ui.registry.addContextToolbar('imgContextToolbar', {
      items: 'image | alignleft aligncenter alignright imgresponsive | removeformat | remove',
      predicate: (elem) => elem.nodeName.toLocaleLowerCase() === 'img' && rangeSelected(),
    });
    editor.ui.registry.addContextToolbar('listContextToolbar', {
      items: 'numlist bullist | outdent indent',
      predicate: (elem) => ['li', 'ol', 'ul'].includes(elem.nodeName.toLocaleLowerCase()) && rangeSelected(),
    });
  }
}

/** Register all formats - like img-sizes */
function registerTinyMceFormats(editor: Editor, imgSizes: number[]): void {
  const imageFormats: ImageFormats = {};
  for (const imgSize of imgSizes) {
    imageFormats[`imgwidth${imgSize}`] = [
      {
        selector: 'img',
        collapsed: false,
        styles: {
          width: `${imgSize}%`,
        },
      },
    ];
  }
  editor.formatter.register(imageFormats);
}

function openPagePicker(editor: Editor, fieldStringWysiwyg: FieldStringWysiwygEditor): void {
  const connector = fieldStringWysiwyg.connector._experimental;

  connector.openPagePicker(page => {
    if (!page) { return; }

    connector.getUrlOfId(`page:${page.id}`, (path) => {
      const previouslySelected = editor.selection.getContent();
      editor.insertContent(`<a href="${path}">${(previouslySelected || page.name)}</a>`);
    });
  });
}

// Mode switching and the buttons for it
function switchModes(mode: 'standard' | 'inline' | 'advanced', editor: Editor, rawEditorOptions: RawEditorOptions): void {
  const newRawEditorOptions: RawEditorOptions = rawEditorOptions;
  newRawEditorOptions.toolbar = rawEditorOptions.modes[mode].toolbar;
  newRawEditorOptions.menubar = rawEditorOptions.modes[mode].menubar;

  // refresh editor toolbar
  editor.editorManager.remove(editor);
  editor.editorManager.init(newRawEditorOptions);
}
