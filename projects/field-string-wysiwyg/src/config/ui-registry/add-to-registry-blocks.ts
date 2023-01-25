import { Guid } from '../../shared/guid';
import { AddContentBlock } from '../public';
import { AddToRegistryParams, AddToRegistryBase } from './add-to-registry-base';

export class TinyButtonsContentBlocks extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
      super(makerParams);
  }

  register(): void {
    this.addButtonContentBlock();
  }


  /** Inside content (contentblocks) */
  private addButtonContentBlock(): void {
    this.regBtn(AddContentBlock,  'custom-content-block', 'ContentBlock.Add', () => {
      const guid = Guid.uuid().toLowerCase();
      this.editor.insertContent(`<hr sxc="sxc-content-block" guid="${guid}" />`);
    });
  }
}
