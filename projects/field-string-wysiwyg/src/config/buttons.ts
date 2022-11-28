import { FieldStringWysiwygEditor, wysiwygEditorTag } from '../editor/editor';
import { loadCustomIcons } from '../editor/load-icons.helper';
import { Guid } from '../shared/guid';
// tslint:disable-next-line: max-line-length
import { AddContentBlock, AddContentSplit, ContentDivision, ContentDivisionClass, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeDefault, ToFullscreen, ToolbarModes, ToolbarModeToggle } from './public';
import { ButtonsMakerParams, TinyButtonsBase } from './tiny-buttons-base';
import { TinyButtonsBullets } from './tiny-buttons-bullets';
import { TinyButtonsHeadings } from './tiny-buttons-headings';
import { TinyButtonsImg } from './tiny-buttons-img';
import { WysiwygAdvanced, WysiwygDefault, WysiwygMode, WysiwygModeCycle, WysiwygModeMedia, WysiwygModeText, WysiwygView } from './tinymce-helper-types';



/** Register all kinds of buttons on TinyMCE */
export class TinyMceButtons extends TinyButtonsBase {

  constructor(private makerParams: ButtonsMakerParams) {
    super(makerParams);
  }

  register(): void {
    const instSettings = this.field.configurator.addOnSettings;

    if (!instSettings.enabled) { return; }

    new TinyButtonsImg(this.makerParams).register();
    new TinyButtonsBullets(this.makerParams).register();
    new TinyButtonsHeadings(this.makerParams).register();

    loadCustomIcons(this.editor);

    this.linkFiles();
    this.linksGroups();
    this.dropDownItalicAndMore();
    this.listButtons();
    this.addSwitchModeButtons();
    this.openDialog();
    this.addButtonContentBlock();
    this.addButtonContentSplitter();
    this.contentDivision();
    this.contextMenus();

    // experimental
    this.addModes();
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
    const linkButton = this.getButtons().link;

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


  /** Drop-down with italic, strikethrough, ... */
  private dropDownItalicAndMore(): void {
    const btns = this.getButtons();
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
    const btns = this.getButtons();

    // Drop-down with numbered list, bullet list, ...
    this.editor.ui.registry.addSplitButton(ListGroup, {
      ...this.splitButtonSpecs('InsertUnorderedList'),
      columns: 3,
      icon: btns.bullist.icon,
      presets: 'listpreview',
      tooltip: btns.bullist.tooltip,
      fetch: (callback) => {
        callback([
          this.splitButtonItem(btns.outdent.icon, btns.outdent.tooltip, 'Outdent'),
          this.splitButtonItem(btns.indent.icon, btns.indent.tooltip, 'Indent'),
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
          this.splitButtonItem('info', 'Default / Balanced', () => { this.cycleMode(WysiwygDefault); }),
          this.splitButtonItem('info', 'Writing Mode', () => { this.cycleMode(WysiwygModeText); }),
          this.splitButtonItem('info', 'Rich Media Mode', () => { this.cycleMode(WysiwygModeMedia); }),
        ]);
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

    }
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
    const buttons = this.getButtons();
    this.editor.ui.registry.addButton(AddContentSplit, {
      icon: buttons.hr.icon,
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


  /** Add Context toolbars */
  private contextMenus(): void {
    const rangeSelected = () => document.getSelection().rangeCount > 0 && !document.getSelection().getRangeAt(0).collapsed;

    this.editor.ui.registry.addContextToolbar('linkContextToolbar', {
      items: 'link unlink',
      predicate: (elem) => elem.nodeName.toLocaleLowerCase() === 'a' && rangeSelected(),
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
