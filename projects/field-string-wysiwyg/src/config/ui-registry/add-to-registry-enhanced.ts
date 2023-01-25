import * as Buttons from '../../constants/buttons';
import { Guid } from '../../shared/guid';
import { ContentDivisionClass } from '../public';
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
    this.editor.ui.registry.addButton(Buttons.AddContentSplit, {
      icon: buttons.hr.icon, // TODO: use a custom icon
      tooltip: 'TODO',
      onAction: (api) => {
        const guid = Guid.uuid().toLowerCase();
        this.editor.insertContent(`<hr class="${ContentDivisionClass}"/>`);
      },
    });
  }


  /** Inside content (contentdivision) */
  private contentDivision(): void {
    this.editor.ui.registry.addButton(Buttons.XXXContentDivision, {
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
