import * as Buttons from '../../constants/buttons';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class TinyButtonsFormatting extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
      super(makerParams);
  }

  register(): void {
    this.dropDownItalicAndMore();
  }


  /** Drop-down with italic, strikethrough, ... */
  private dropDownItalicAndMore(): void {
    const btns = this.getButtons();
    this.editor.ui.registry.addSplitButton(Buttons.StylesGroup, {
      ...this.splitButtonSpecs('Italic'),
      columns: 3,
      icon: btns.italic.icon,
      presets: 'listpreview',
      tooltip: btns.italic.tooltip,
      fetch: (callback) => {
        callback([
          this.splitButtonItem(btns.strikethrough.icon, btns.strikethrough.tooltip, 'Strikethrough'),
          this.splitButtonItem(btns.superscript.icon, btns.superscript.tooltip, 'Superscript'),
          this.splitButtonItem(btns.subscript.icon, btns.subscript.tooltip, 'Subscript'),
        ]);
      },
    });
  }
}
