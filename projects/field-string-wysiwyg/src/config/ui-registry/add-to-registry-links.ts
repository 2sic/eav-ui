import * as Buttons from '../../constants/buttons';
import { FieldStringWysiwygEditor } from '../../editor/editor';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class TinyButtonsLinks extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
      super(makerParams);
  }

  register(): void {
    this.addLinkPage();
    this.contextMenus();
    this.linkFiles();
    this.linksGroups();
  }


  /** Add Context toolbars */
  private contextMenus(): void {
    const rangeSelected = this.rangeSelected;

    this.editor.ui.registry.addContextToolbar('linkContextToolbar', {
      items: 'link unlink',
      predicate: (elem) => elem.nodeName.toLocaleLowerCase() === 'a' && rangeSelected(),
    });
  }


  /** Group with adam-link, dnn-link */
  private linkFiles(): void {
    const thisForLater = this;
    this.editor.ui.registry.addSplitButton(Buttons.LinkFiles, {
      ...this.splitButtonSpecs(() => thisForLater.toggleAdam(false, false)),
      columns: 3,
      icon: 'custom-file-pdf',
      presets: 'listpreview',
      tooltip: 'Link.AdamFile.Tooltip',
      fetch: (callback) => {
        callback([
          this.splitButtonItem('custom-file-pdf', 'Link.AdamFile.Tooltip', () => thisForLater.toggleAdam(false, false)),
          this.splitButtonItem('custom-file-dnn', 'Link.DnnFile.Tooltip', () => thisForLater.toggleAdam(true, false)),
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

    this.editor.ui.registry.addSplitButton(!isPro ? Buttons.LinkGroup : Buttons.LinkGroupPro, {
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

  private addLinkPage(): void {
    this.regBtn(Buttons.LinkPageButton, 'custom-sitemap', 'Link.Page.Tooltip', () => openPagePicker(this.field));
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
