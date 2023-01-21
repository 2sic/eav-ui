import { loadCustomIcons } from '../../editor/load-icons.helper';
import { AddToRegistryParams, AddToRegistryBase } from './add-to-registry-base';
import { TinyButtonsBullets } from './add-to-registry-bullets';
import { TinyButtonsContentBlocks } from './add-to-registry-blocks';
import { TinyButtonsDialog } from './add-to-registry-dialog';
import { TinyButtonsFormatting } from './add-to-registry-formatting';
import { TinyButtonsHeadings } from './add-to-registry-headings';
import { TinyButtonsImg } from './add-to-registry-img';
import { TinyButtonsLinks } from './add-to-registry-links';
import { TinyButtonsModes } from './add-to-registry-modes';
import { TinyButtonsWysiwygEnhanced } from './add-to-registry-enhanced';

/** Register all kinds of buttons on TinyMCE */
export class AddEverythingToRegistry extends AddToRegistryBase {

  constructor(private makerParams: AddToRegistryParams) {
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
