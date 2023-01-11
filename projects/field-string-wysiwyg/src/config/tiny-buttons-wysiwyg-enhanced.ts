import { Guid } from '../shared/guid';
import { AddContentSplit, ContentDivision, ContentDivisionClass } from './public';
import { ButtonsMakerParams, TinyButtonsBase } from './tiny-buttons-base';

export class TinyButtonsWysiwygEnhanced extends TinyButtonsBase {
  constructor(makerParams: ButtonsMakerParams) {
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
