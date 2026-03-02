import { loadCustomIcons } from '../../editor/load-icons.helper';
import { AddToRegistryBase } from './add-to-registry-base';
import { AddToRegistryParams } from './add-to-registry-params';
import { TinyButtonsBullets } from './buttons-bullets';
import { TinyButtonsContentBlocks } from './buttons-content-blocks';
import { TinyButtonsDialog } from './buttons-dialog';
import { TinyButtonsFormatting } from './buttons-formatting';
import { TinyButtonsHeadings } from './buttons-headings';
import { TinyButtonsImg } from './buttons-img';
import { TinyButtonsLinks } from './buttons-links';
import { TinyButtonsModes } from './buttons-modes';
import { AddToRegistryWysiwygSections } from './buttons-wysiwyg-sections';

/** Register all kinds of buttons on TinyMCE */
export class AddEverythingToRegistry extends AddToRegistryBase {

  constructor(makerParams: AddToRegistryParams) {
    super(makerParams);
  }

  register(): void {
    const instSettings = this.field.configurator.addOnSettings;

    if (!instSettings.enabled)
      return;

    const p = this.makerParams;
    new TinyButtonsImg(p).register();
    new TinyButtonsBullets(p).register();
    new TinyButtonsHeadings(p).register();
    new TinyButtonsFormatting(p).register();
    new TinyButtonsLinks(p).register();
    new AddToRegistryWysiwygSections(p).register();
    new TinyButtonsContentBlocks(p).register();
    new TinyButtonsDialog(p).register();
    new TinyButtonsModes(p).register();

    loadCustomIcons(this.editor);
  }
}
