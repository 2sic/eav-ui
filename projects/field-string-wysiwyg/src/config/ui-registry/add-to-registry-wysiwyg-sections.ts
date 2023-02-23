import * as Buttons from '../../constants/buttons';
import * as RichSpecs from '../../constants/rich-wysiwyg';
import { ImageFormats } from '../../shared/models';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class AddToRegistryWysiwygSections extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
      super(makerParams);
  }

  register(): void {
    // this.sectionButtons();
    this.addButtonContentSplitter();
    this.splitterSizeButtons();
    this.contextMenus();
    this.splitterSizeFormats();
  }

  private addButtonContentSplitter(): void {
    const buttons = this.getButtons();
    this.regBtn(Buttons.ContentSectionSplitter, buttons.hr.icon, 'ContentBlock.Add', () => {
      this.editor.insertContent(`<hr class="${RichSpecs.ContentSplitterClass}"/>`);
    });
  }

  
  private splitterSizeButtons(): void {
    RichSpecs.ContentSplitters.forEach((cs) => {
      this.regBtn(cs.name, cs.icon,
        'todo', // editor.translate([ai.tooltip ?? btns[ai.inherit]?.tooltip]),
        () => { this.toggleOneClassFromList(cs.class, RichSpecs.ContentSplitters.map(x => x.class)); });
    });
  }

    /** Register all formats - like img-sizes */
   private splitterSizeFormats(): void {
      const formatter = this.editor.formatter;
      RichSpecs.ContentSplitters.forEach(cs => {
        formatter.register(cs.class, { selector: 'hr', classes: cs.class });
      })
    }


  /** Add Context Menu for Section HRs */
  private contextMenus(): void {
    const rangeSelected = this.rangeSelected;

    this.editor.ui.registry.addContextToolbar('wysiwygSectionContextToolbar', {
      items: RichSpecs.ContentSplitters.map(cs => cs.name).join(' '), // 'numlist numlist | numlist numlist | numlist numlist',
      // TODO: ONLY detect HRs with a wysiwyg-class
      predicate: (elem) => ['hr'].includes(elem.nodeName.toLocaleLowerCase()) && rangeSelected(),
    });
  }
}
