import { loadCustomIcons } from '../editor/load-icons.helper';
// tslint:disable-next-line: max-line-length
import { ButtonsMakerParams, TinyButtonsBase } from './tiny-buttons-base';
import { TinyButtonsBullets } from './tiny-buttons-bullets';
import { TinyButtonsContentBlocks } from './tiny-buttons-content-blocks';
import { TinyButtonsDialog } from './tiny-buttons-dialog';
import { TinyButtonsFormatting } from './tiny-buttons-formatting';
import { TinyButtonsHeadings } from './tiny-buttons-headings';
import { TinyButtonsImg } from './tiny-buttons-img';
import { TinyButtonsLinks } from './tiny-buttons-links';
import { TinyButtonsModes } from './tiny-buttons-modes';
import { TinyButtonsWysiwygEnhanced } from './tiny-buttons-wysiwyg-enhanced';

/** Register all kinds of buttons on TinyMCE */
export class TinyMceButtons extends TinyButtonsBase {

  constructor(private makerParams: ButtonsMakerParams) {
    super(makerParams);
  }

  register(): void {
    const instSettings = this.field.configurator.addOnSettings;

    if (!instSettings.enabled) { return; }

    const p = this.makerParams;
    new TinyButtonsImg(p).register();
    new TinyButtonsBullets(p).register();
    new TinyButtonsHeadings(p).register();
    new TinyButtonsFormatting(p).register();
    new TinyButtonsLinks(p).register();
    new TinyButtonsWysiwygEnhanced(p).register();
    new TinyButtonsContentBlocks(p).register();
    new TinyButtonsDialog(p).register();
    new TinyButtonsModes(p).register();

    loadCustomIcons(this.editor);
  }
}
