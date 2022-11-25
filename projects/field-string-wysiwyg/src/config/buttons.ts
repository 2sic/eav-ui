import type { Editor } from 'tinymce';
import { Ui } from 'tinymce';
import { Adam } from '../../../edit-types';
import { FieldStringWysiwygEditor, wysiwygEditorTag } from '../editor/editor';
import { loadCustomIcons } from '../editor/load-icons.helper';
import { Guid } from '../shared/guid';
import { ImageFormats } from '../shared/models';
import { RawEditorOptionsWithModes, WysiwygAdvanced, WysiwygInline, WysiwygMode, WysiwygView, WysiwygDefault, WysiwygModeText, WysiwygModeMedia, WysiwygModeCycle } from './tinymce-helper-types';

// Export Constant names because these will become standardized
// So people can use them in their custom toolbars
export const ItalicWithMore = 'italic-more'; // used to be 'formatgroup'
export const SxcImages = 'images-cms'; // used to be 'images'
export const LinkGroup = 'linkgroup';
export const LinkGroupPro = 'linkgrouppro';
export const LinkFiles = 'linkfiles';
export const ListGroup = 'listgroup';
export const ModeDefault = 'modestandard';
// export const ToModeInline = 'modeinline';
export const ToolbarModeToggle = 'wysiwyg-toolbar-mode';
export const ToolbarModes = 'wysiwyg-toolbar-modes';
export const ModeAdvanced = 'modeadvanced';
export const H1Group = 'h1group';
export const H2Group = 'h2group';
export const H3Group = 'h3group';
export const H4Group = 'h4group';
export const AddContentBlock = 'addcontentblock';
export const ContentDivision = 'contentdivision';
export const ToFullscreen = 'expandfulleditor'; // not sure what this does
export const ImgResponsive = 'imgresponsive';

export const AddContentSplit = 'contentsplit';
const ContentDivisionClass = 'content-division';

type FuncVoid = () => void | unknown;



/** Register all kinds of buttons on TinyMCE */
export class TinyMceButtons {

  constructor(private field: FieldStringWysiwygEditor, private editor: Editor, private adam: Adam, private options: RawEditorOptionsWithModes) {

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
    this.headingGroups1to4();
    this.addButtonContentBlock();
    this.addButtonContentSplitter();
    this.contentDivision();
    this.imageContextMenu(instSettings.imgSizes);
    this.contextMenus();

    // experimental
    this.addModes();
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
          this.splitButtonItem(linkButton.icon, imageButton.tooltip, 'mceImage'),
          this.splitButtonItem(alignleftButton.icon, alignleftButton.tooltip,'JustifyLeft'),
          this.splitButtonItem(aligncenterButton.icon, aligncenterButton.tooltip, 'JustifyCenter'),
          this.splitButtonItem(alignrightButton.icon, alignrightButton.tooltip, 'JustifyRight'),
        ]);
      },
    });
  }

  /** Drop-down with italic, strikethrough, ... */
  private dropDownItalicAndMore(): void {
    const btns = this.editor.ui.registry.getAll().buttons;
    this.editor.ui.registry.addSplitButton(ItalicWithMore, {
      ...this.splitButtonSpecs('Italic'),
      columns: 3,
      icon: btns.italic.icon,
      presets: 'listpreview',
      tooltip: btns.italic.tooltip,
      fetch: (callback) => {
        callback([
          this.splitButtonItem(btns.strikethrough.icon, btns.strikethrough.tooltip, 'Strikethrough'),
          this.splitButtonItem(btns.superscript.icon, btns.superscript.tooltip, 'Superscript'),
          this.splitButtonItem(btns.subscript.icon, btns.subscript.tooltip, 'Subscript'),
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
    this.editor.ui.registry.addButton(ModeDefault, {
      icon: 'close',
      tooltip: 'SwitchMode.Standard',
      onAction: (api) => { this.switchMode(WysiwygDefault); },
    });
    // this.editor.ui.registry.addButton(ToModeInline, {
    //   icon: 'close',
    //   tooltip: 'SwitchMode.Standard',
    //   onAction: (api) => { this.switchModeNew(WysiwygDefault, WysiwygInline); },
    // });
    this.editor.ui.registry.addButton(ModeAdvanced, {
      icon: 'custom-school',
      tooltip: 'SwitchMode.Pro',
      onAction: (api) => { this.switchMode(WysiwygAdvanced); },
    });
  }

  // TODO: @SDV pls change wherever possible to use this as it's quite a bit shorter
  private regBtn(name: string, icon: string, tooltip: string, action: () => void) {
    this.editor.ui.registry.addButton(name, {
      icon,
      tooltip,
      onAction: action,
    });    
  }

  // TODO: @2dm / @SDV
  // - i18n
  // - icons
  // - finalize toolbars
  // - see if we can right-align the last toolbar part
  private addModes(): void {
    this.regBtn(ToolbarModeToggle, 'settings', 'SwitchMode.Tooltip',
      () => { this.cycleMode(); });

    this.editor.ui.registry.addSplitButton(ToolbarModes, {
      ...this.splitButtonSpecs(() => this.cycleMode()),
      icon: 'settings',
      tooltip: 'SwitchMode.Tooltip',
      fetch: (callback) => {
        callback([
          this.splitButtonItem('info', 'Default / Balanced', () => { this.cycleMode(WysiwygDefault)}),
          this.splitButtonItem('info', 'Writing Mode', () => { this.cycleMode(WysiwygModeText)}),
          this.splitButtonItem('info', 'Rich Media Mode', () => { this.cycleMode(WysiwygModeMedia)}),
        ])
      }
    });
  }

  private cycleMode(newMode?: WysiwygMode): void {
    if (!newMode) {
      const current = this.options.currentMode.mode;
      const idx = WysiwygModeCycle.indexOf(current) + 1; // will be a number or 0 afterwards
      newMode = (idx < WysiwygModeCycle.length)
        ? WysiwygModeCycle[idx]
        : WysiwygModeCycle[0];
      console.log('2dm idx ' + idx + '; length' + WysiwygModeCycle.length + ';' + current);

    }
    console.log('2dm new ' + newMode);
    this.switchMode(newMode);
  }

  /** Switch to Dialog Mode */
  // todo: docs say that Drawer is being deprecated ? but I don't think this has to do
  // with drawer?
  // https://www.tiny.cloud/docs/configure/editor-appearance/#toolbar_mode
  private openDialog(): void {
    this.editor.ui.registry.addButton(ToFullscreen, {
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
  private headingGroups1to4(): void {
    const isGerman = this.editor.options.get('language') === 'de';
    const btns = this.editor.ui.registry.getAll().buttons;
    const blockquote = btns.blockquote;
    const imgName = isGerman ? 'custom-image-u' : 'custom-image-h';

    const HButtons = [
      this.splitButtonItem(`${imgName}1`, btns.h1.text, () => this.toggleFormat('h1')),
      this.splitButtonItem(`${imgName}2`, btns.h2.text, () => this.toggleFormat('h2')),
      this.splitButtonItem(`${imgName}3`, btns.h3.text, () => this.toggleFormat('h3')),
      this.splitButtonItem('custom-paragraph', 'Paragraph', () => this.toggleFormat('p')),
      this.splitButtonItem(`${imgName}4`, btns.h4.text, () => this.toggleFormat('h4')),
      this.splitButtonItem(`${imgName}5`, btns.h5.text, () => this.toggleFormat('h5')),
      this.splitButtonItem(`${imgName}6`, btns.h6.text, () => this.toggleFormat('h6')),
      this.splitButtonItem(blockquote.icon, blockquote.tooltip, () => this.toggleFormat('blockquote')),
    ];
    this.headingsGroup(H1Group, 'h1', btns.h1 as Ui.Toolbar.ToolbarSplitButtonSpec, HButtons);
    this.headingsGroup(H2Group, 'h2', btns.h2 as Ui.Toolbar.ToolbarSplitButtonSpec, HButtons);
    this.headingsGroup(H3Group, 'h3', btns.h3 as Ui.Toolbar.ToolbarSplitButtonSpec, HButtons);
    this.headingsGroup(H4Group, 'h4', btns.h4 as Ui.Toolbar.ToolbarSplitButtonSpec, HButtons);
  }

  private headingsGroup(groupName: string, mainFormat: string, button: Ui.Toolbar.ToolbarSplitButtonSpec, buttons: Ui.Menu.ChoiceMenuItemSpec[]): void {
    this.editor.ui.registry.addSplitButton(groupName, {
      ...this.splitButtonSpecs(() => this.toggleFormat(mainFormat)),
      columns: 4,
      presets: 'listpreview',
      text: button.text,
      tooltip: button.tooltip,
      fetch: (callback) => { callback(buttons); },
    });
  }

  /** Inside content (contentblocks) */
  private addButtonContentBlock(): void {
    this.editor.ui.registry.addButton(AddContentBlock, {
      icon: 'custom-content-block',
      tooltip: 'ContentBlock.Add',
      onAction: (api) => {
        const guid = Guid.uuid().toLowerCase();
        this.editor.insertContent(`<hr sxc="sxc-content-block" guid="${guid}" />`);
      },
    });
  }

  private addButtonContentSplitter(): void {
    const buttons = this.editor.ui.registry.getAll().buttons;
    this.editor.ui.registry.addButton(AddContentSplit, {
      icon: buttons.hr.icon, // 'custom-content-block',
      tooltip: 'ContentBlock.Add',
      onAction: (api) => {
        const guid = Guid.uuid().toLowerCase();
        this.editor.insertContent(`<hr class="${ContentDivisionClass}"/>`);
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
        this.editor.insertContent(`<div class="${ContentDivisionClass}"><p></p></div>`);
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

  /** Mode switching to inline/dialog and advanced/normal */
  private switchMode(mode: WysiwygMode, viewMode?: WysiwygView): void {
      viewMode ??= this.options.currentMode.view;
      const newSettings = this.options.modeSwitcher.switch(viewMode, mode);
      // don't create a new object, we must keep a refernec to the old
      // don't do this: this.options = {...this.options, ...newSettings};
      this.options.toolbar = newSettings.toolbar;
      this.options.menubar = newSettings.menubar;
      this.options.currentMode = newSettings.currentMode;
      this.options.contextmenu = newSettings.contextmenu;

      // refresh editor toolbar
      this.editor.editorManager.remove(this.editor);
      this.editor.editorManager.init(this.options);
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
