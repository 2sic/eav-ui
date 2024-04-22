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
    const editor = this.editor;
    RichSpecs.ContentSplitters.forEach((cs) => {
      editor.ui.registry.addToggleButton(cs.name, {
        icon: cs.icon,
        tooltip: 'TODO:', // editor.translate([ai.tooltip ?? btns[ai.inherit]?.tooltip]),
        onAction: () => { this.editor.insertContent(`<hr class="${RichSpecs.ContentSplitterClass} ${cs.class}"/>`); },
        onSetup: (api) => {
          // console.log('2dm, api', api);
          api.setActive(editor.formatter.match(cs.class));
          const changed = editor.formatter.formatChanged(cs.class, (state) => api.setActive(state));
          return () => changed.unbind();
        }
      });
    });
  }


  private splitterResizeButtons(): void {
    const editor = this.editor;
    RichSpecs.ContentSplitters.forEach((cs) => {
      editor.ui.registry.addToggleButton(cs.name + Buttons.toggleSuffix, {
        icon: cs.icon,
        tooltip: 'TODO:', // editor.translate([ai.tooltip ?? btns[ai.inherit]?.tooltip]),
        onAction: () => { this.toggleOneClassFromList(cs.class, RichSpecs.ContentSplitters.map(x => x.class)); },
        onSetup: (api) => {
          api.setActive(editor.formatter.match(cs.class));
          const changed = editor.formatter.formatChanged(cs.class, (state) => api.setActive(state));
          return () => changed.unbind();
        }
      }
      );
    });
  }

    /** Register all formats - like img-sizes */
   private splitterSizeFormats(): void {
      const formatter = this.editor.formatter;
      RichSpecs.ContentSplitters.forEach(cs => {
        formatter.register(cs.class, { selector: 'hr', classes: cs.class });
      });
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
