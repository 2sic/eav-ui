import * as Buttons from '../../constants/buttons';
import * as RichSpecs from '../../constants/rich-wysiwyg';
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
    this.regBtn(Buttons.ContentSectionSplitter, buttons.hr.icon, 'ContentBlock.Add', () => {
      this.editor.insertContent(`<hr class="${RichSpecs.ContentSplitterClass}"/>`);
    });
  }


  /** Inside content (contentdivision) */
  private contentDivision(): void {
    this.regBtn(Buttons.XXXContentDivision, 'custom-branding-watermark', 'ContentDivision.Add', () => {
      // Important: the class "content-division" must match the css
      this.editor.insertContent(`<div class="${RichSpecs.ContentSplitterClass}"><p></p></div>`);
    });
  }
}
