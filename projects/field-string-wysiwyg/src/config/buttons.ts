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
export const LinkGroup = 'linkgroup';
export const LinkGroupPro = 'linkgrouppro';
export const LinkFiles = 'linkfiles';
export const ListGroup = 'listgroup';
export const ModeStandard = 'modestandard';
export const ModeInline = 'modeinline';
export const ModeAdvanced = 'modeadvanced';
export const HGroup = 'hgroup';
export const AddContentBlock = 'addcontentblock';
export const ContentDivision = 'contentdivision';
export const ExpandFullEditor = 'expandfulleditor';
export const ImgResponsive = 'imgresponsive';

// TODO: @SDV - move all names which are used elsewhele - like button names etc.
// to exports above, and use these in the toolbars.ts
// so I can rename then later on before publishing
// As the names will have to become public terms so I must control them exactly

type FuncVoid = () => void | unknown;

/** Register all kinds of buttons on TinyMCE */
export class TinyMceButtons {

  constructor(private field: FieldStringWysiwygEditor, private editor: Editor, private adam: Adam, private options: RawEditorOptions) {

  }

  registerAll(): void {
    const instSettings = this.field.configurator.addOnSettings;

    if (!instSettings.enabled) { return; }

    registerTinyMceFormats(this.editor, instSettings.imgSizes);

    loadCustomIcons(this.editor);

    this.linkFiles();

    this.linksGroups();

    this.images();

    this.dropDownItalicAndMore();

    this.listButtons();

    this.addSwitchModeButtons();

    this.openDialog();

    this.headingsGroup();

    this.contentBlock();

    this.contentDivision();

    this.imageContextMenu(instSettings.imgSizes);

    this.contextMenus();
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
    this.editor.ui.registry.addSplitButton(LinkFiles, {
      ...this.splitButtonSpecs(() => adam.toggle(false, false)),
      columns: 3,
      icon: 'custom-file-pdf',
      presets: 'listpreview',
      tooltip: 'Link.AdamFile.Tooltip',
      fetch: (callback) => {
        callback([
          this.splitButtonItem('custom-file-pdf', 'Link.AdamFile.Tooltip', () => adam.toggle(false, false)),
          this.splitButtonItem('custom-file-dnn', 'Link.DnnFile.Tooltip', () => adam.toggle(true, false)),
        ]);
      },
    });
  }

  /** Button groups for links (simple and pro) with web-link, page-link, unlink, anchor */
  private linksGroups(): void {
    this.addLinkGroup(false);
    this.addLinkGroup(true);
  }

  private addLinkGroup(isPro: boolean): void {
    const linkButton = this.editor.ui.registry.getAll().buttons.link;

    this.editor.ui.registry.addSplitButton(!isPro ? LinkGroup : LinkGroupPro, {
      ...this.splitButtonSpecs('mceLink'),
      columns: 3,
      icon: linkButton.icon,
      presets: 'listpreview',
      tooltip: linkButton.tooltip,
      fetch: (callback) => {
        callback([
          this.splitButtonItem(linkButton.icon, linkButton.tooltip, 'mceLink'),
          this.splitButtonItem('custom-sitemap', 'Link.Page.Tooltip', () => openPagePicker(this.field)),
          ...(!isPro ? [] : [
            this.splitButtonItem('custom-anchor', 'Link.Anchor.Tooltip', 'mceAnchor')
          ]),
        ]);
      },
    });
  }

  /** Images menu */
  private images(): void {
    const adam = this.adam;
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
      fetch: (callback) => {
        callback([
          this.splitButtonItem(imageButton.icon, 'Image.AdamImage.Tooltip', () => adam.toggle(false, true)),
          this.splitButtonItem('custom-file-dnn', 'Image.DnnImage.Tooltip', () => adam.toggle(true, true)),
          // @SDV - the methods here look wrong, I assume it should just be the string, not a function
          // similar to the examples further down with 'Strikethrough' etc.
          this.splitButtonItem(linkButton.icon, imageButton.tooltip, () => 'mceImage'),
          this.splitButtonItem(alignleftButton.icon, alignleftButton.tooltip, () => 'JustifyLeft'),
          this.splitButtonItem(aligncenterButton.icon, aligncenterButton.tooltip, () => 'JustifyCenter'),
          this.splitButtonItem(alignrightButton.icon, alignrightButton.tooltip, () => 'JustifyRight'),
        ]);
      },
    });
  }

  /** Drop-down with italic, strikethrough, ... */
  private dropDownItalicAndMore(): void {
    const buttons = this.editor.ui.registry.getAll().buttons;
    const italicButton = buttons.italic;
    // const strikethroughButton = buttons.strikethrough;
    const superscriptButton = buttons.superscript;
    const subscriptButton = buttons.subscript;

    this.editor.ui.registry.addSplitButton(ItalicWithMore, {
      ...this.splitButtonSpecs('Italic'),
      columns: 3,
      icon: italicButton.icon,
      presets: 'listpreview',
      tooltip: italicButton.tooltip,
      fetch: (callback) => {
        callback([
          this.splitButtonItem(buttons.strikethrough.icon, buttons.strikethrough.tooltip, 'Strikethrough'),
          this.splitButtonItem(superscriptButton.icon, superscriptButton.tooltip, 'Superscript'),
          this.splitButtonItem(subscriptButton.icon, subscriptButton.tooltip, 'Subscript'),
        ]);
      },
    });
  }

  /** Lists / Indent / Outdent etc. */
  private listButtons(): void {
    const buttons = this.editor.ui.registry.getAll().buttons;
    const bullistButton = buttons.bullist;
    const outdentButton = buttons.outdent;
    const indentButton = buttons.indent;

    // Drop-down with numbered list, bullet list, ...
    this.editor.ui.registry.addSplitButton(ListGroup, {
      ...this.splitButtonSpecs('InsertUnorderedList'),
      columns: 3,
      icon: bullistButton.icon,
      presets: 'listpreview',
      tooltip: bullistButton.tooltip,
      fetch: (callback) => {
        callback([
          this.splitButtonItem(outdentButton.icon, outdentButton.tooltip, 'Outdent'),
          this.splitButtonItem(indentButton.icon, indentButton.tooltip, 'Indent'),
        ]);
      },
    });
  }

  /** Switch normal / advanced mode */
  private addSwitchModeButtons(): void {
    this.editor.ui.registry.addButton(ModeStandard, {
      icon: 'close',
      tooltip: 'SwitchMode.Standard',
      onAction: (api) => {
        switchModes('standard');
      },
    });
    this.editor.ui.registry.addButton(ModeInline, {
      icon: 'close',
      tooltip: 'SwitchMode.Standard',
      onAction: (api) => {
        switchModes('inline');
      },
    });
    this.editor.ui.registry.addButton(ModeAdvanced, {
      icon: 'custom-school',
      tooltip: 'SwitchMode.Pro',
      onAction: (api) => {
        switchModes('advanced');
      },
    });
  }

  /** Switch to Dialog Mode */
  private openDialog(): void {
    this.editor.ui.registry.addButton(ExpandFullEditor, {
      icon: 'browse',
      tooltip: 'SwitchMode.Expand',
      onAction: (api) => {
        // fixes bug where toolbar drawer is shown above full mode tinymce
        const toolbarDrawerOpen = this.editor.queryCommandState('ToggleToolbarDrawer');
        if (toolbarDrawerOpen) {
          this.editor.execCommand('ToggleToolbarDrawer');
        }
        this.field.connector.dialog.open(wysiwygEditorTag);
      },
    });
  }

  private toggleFormat(tag: string) {
    this.editor.execCommand('mceToggleFormat', false, tag);
  }

  /** Group of buttons with an h3 to start and showing h4-6 + p */
  private headingsGroup(): void {
    const isGerman = this.editor.options.get('language') === 'de';
    const buttons = this.editor.ui.registry.getAll().buttons;

    const h1Button = buttons.h1;
    const h2Button = buttons.h2;
    const h3Button = buttons.h3;
    const h4Button = buttons.h4;
    const h5Button = buttons.h5;
    const h6Button = buttons.h6;
    const blockquoteButton = buttons.blockquote;

    const imgName = isGerman ? 'custom-image-u' : 'custom-image-h';

    this.editor.ui.registry.addSplitButton(HGroup, {
      ...this.splitButtonSpecs(() => this.toggleFormat('h4')),
      columns: 4,
      presets: 'listpreview',
      text: h4Button.text,
      tooltip: h4Button.tooltip,
      fetch: (callback) => {
        callback([
          this.splitButtonItem(`${imgName}1`, h1Button.text, () => this.toggleFormat('h1')),
          this.splitButtonItem(`${imgName}2`, h2Button.text, () => this.toggleFormat('h2')),
          this.splitButtonItem(`${imgName}3`, h3Button.text, () => this.toggleFormat('h3')),
          this.splitButtonItem('custom-paragraph', 'Paragraph', () => this.toggleFormat('p')),
          this.splitButtonItem(`${imgName}4`, h4Button.text, () => this.toggleFormat('h4')),
          this.splitButtonItem(`${imgName}5`, h5Button.text, () => this.toggleFormat('h5')),
          this.splitButtonItem(`${imgName}6`, h6Button.text, () => this.toggleFormat('h6')),
          this.splitButtonItem(blockquoteButton.icon, blockquoteButton.tooltip, () => this.toggleFormat('blockquote')),
        ]);
      },
    });
  }

  /** Inside content (contentblocks) */
  private contentBlock(): void {
    this.editor.ui.registry.addButton(AddContentBlock, {
      icon: 'custom-content-block',
      tooltip: 'ContentBlock.Add',
      onAction: (api) => {
        const guid = Guid.uuid().toLowerCase();
        this.editor.insertContent(`<hr sxc="sxc-content-block" guid="${guid}" />`);
      },
    });
  }

  /** Inside content (contentdivision) */
  private contentDivision(): void {
    this.editor.ui.registry.addButton(ContentDivision, {
      // todo: strange name, mut review @SDV
      icon: 'custom-branding-watermark',
      tooltip: 'ContentDivision.Add',
      onAction: (api) => {
        // Important: the class "content-division" must match the css
        this.editor.insertContent(`<div class="content-division"></div>`);
      },
    });
  }

  /** Image alignment / size buttons in context menu */
  private imageContextMenu(imgSizes: number[]): void {
    this.editor.ui.registry.addSplitButton(ImgResponsive, {
      ...this.splitButtonSpecs(() => this.editor.formatter.apply('imgwidth100')),
      icon: 'resize',
      tooltip: '100%',
      fetch: (callback) => {
        callback(
          // WARNING! This part is not fully type safe
          imgSizes.map(imgSize => ({
            icon: 'resize',
            text: `${imgSize}%`,
            type: 'choiceitem',
            value: (() => { this.editor.formatter.apply(`imgwidth${imgSize}`); }) as any,
          })),
        );
      },
    });
  }

  /** Add Context toolbars */
  private contextMenus(): void {
    const rangeSelected = () => document.getSelection().rangeCount > 0 && !document.getSelection().getRangeAt(0).collapsed;

    this.editor.ui.registry.addContextToolbar('linkContextToolbar', {
      items: 'link unlink',
      predicate: (elem) => elem.nodeName.toLocaleLowerCase() === 'a' && rangeSelected(),
    });
    this.editor.ui.registry.addContextToolbar('imgContextToolbar', {
      items: 'image | alignleft aligncenter alignright imgresponsive | removeformat | remove',
      predicate: (elem) => elem.nodeName.toLocaleLowerCase() === 'img' && rangeSelected(),
    });
    this.editor.ui.registry.addContextToolbar('listContextToolbar', {
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

function openPagePicker(fieldStringWysiwyg: FieldStringWysiwygEditor): void {
  const connector = fieldStringWysiwyg.connector._experimental;

  connector.openPagePicker(page => {
    if (!page) { return; }

    connector.getUrlOfId(`page:${page.id}`, (path) => {
      const previouslySelected = this.editor.selection.getContent();
      this.editor.insertContent(`<a href="${path}">${(previouslySelected || page.name)}</a>`);
    });
  });
}

// Mode switching and the buttons for it
function switchModes(mode: 'standard' | 'inline' | 'advanced'): void {
  const newRawEditorOptions: RawEditorOptions = this.options;
  newRawEditorOptions.toolbar = this.options.modes[mode].toolbar;
  newRawEditorOptions.menubar = this.options.modes[mode].menubar;

  // refresh editor toolbar
  this.editor.editorManager.remove(this.editor);
  this.editor.editorManager.init(newRawEditorOptions);
}
