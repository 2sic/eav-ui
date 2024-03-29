import * as Buttons from '../../constants/buttons';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class TinyButtonsBullets extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
      super(makerParams);
  }

  register(): void {
    this.listButtons();
    this.contextMenus();
  }


  /** Lists / Indent / Outdent etc. */
  private listButtons(): void {
    const btns = this.getButtons();

    // Drop-down with numbered list, bullet list, ...
    this.editor.ui.registry.addSplitButton(Buttons.ListGroup, {
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

  /** Add Context toolbars */
  private contextMenus(): void {
    const rangeSelected = this.rangeSelected;

    this.editor.ui.registry.addContextToolbar('listContextToolbar', {
      items: 'numlist bullist | outdent indent',
      predicate: (elem) => ['li', 'ol', 'ul'].includes(elem.nodeName.toLocaleLowerCase()) && rangeSelected(),
    });
  }
}
