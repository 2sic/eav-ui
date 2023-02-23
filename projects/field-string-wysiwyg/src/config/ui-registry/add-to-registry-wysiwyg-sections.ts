import * as Buttons from '../../constants/buttons';
import * as RichSpecs from '../../constants/rich-wysiwyg';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class AddToRegistryWysiwygSections extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
      super(makerParams);
  }

  register(): void {
    // this.sectionButtons();
    this.splitterAddButtons();
    this.splitterResizeButtons();
    this.splitterContextMenu();
    this.splitterSizeFormats();
  }

  private splitterAddButtons(): void {
    RichSpecs.ContentSplitters.forEach((cs) => {
      this.regBtn(cs.name, cs.icon,
        'TODO:', // editor.translate([ai.tooltip ?? btns[ai.inherit]?.tooltip]),
        () => { this.editor.insertContent(`<hr class="${RichSpecs.ContentSplitterClass} ${cs.class}"/>`); });
    });
  }

  
  private splitterResizeButtons(): void {
    RichSpecs.ContentSplitters.forEach((cs) => {
      // TODO: @sdv - improve registered button so it toggles as "active" if the class is present
      this.regBtn(cs.name + Buttons.toggleSuffix, cs.icon,
        'TODO:', // editor.translate([ai.tooltip ?? btns[ai.inherit]?.tooltip]),
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
  private splitterContextMenu(): void {
    const rangeSelected = this.rangeSelected;

    this.editor.ui.registry.addContextToolbar('wysiwygSectionContextToolbar', {
      // Create toolbar like `splitter-0-toggle splitter-1-toggle splitter-2-toggle`
      items: RichSpecs.ContentSplitters.map(cs => cs.name + Buttons.toggleSuffix).join(' '),
      // TODO: @sdv ONLY detect HRs with a `wysiwyg-splitter`
      predicate: (elem) => ['hr'].includes(elem.nodeName.toLocaleLowerCase()) && rangeSelected(),
    });
  }
}
