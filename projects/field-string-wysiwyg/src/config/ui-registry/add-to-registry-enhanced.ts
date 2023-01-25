import { Guid } from '../../shared/guid';
import { AddContentSplit, ContentDivision, ContentDivisionClass } from '../public';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class TinyButtonsWysiwygEnhanced extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
      super(makerParams);
  }

  register(): void {
    this.addButtonContentSplitter();
    this.contentDivision();
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
}
