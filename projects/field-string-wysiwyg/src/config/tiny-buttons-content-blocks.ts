import { Guid } from '../shared/guid';
import { AddContentBlock } from './public';
import { ButtonsMakerParams, TinyButtonsBase } from './tiny-buttons-base';

export class TinyButtonsContentBlocks extends TinyButtonsBase {
  constructor(makerParams: ButtonsMakerParams) {
      super(makerParams);
  }

  register(): void {
    this.addButtonContentBlock();
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

}
