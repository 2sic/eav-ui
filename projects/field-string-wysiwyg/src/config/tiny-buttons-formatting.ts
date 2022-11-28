import { ItalicWithMore } from './public';
import { ButtonsMakerParams, TinyButtonsBase } from './tiny-buttons-base';

export class TinyButtonsFormatting extends TinyButtonsBase {
  constructor(makerParams: ButtonsMakerParams) {
      super(makerParams);
  }

  register(): void {
    this.dropDownItalicAndMore();
  }


  /** Drop-down with italic, strikethrough, ... */
  private dropDownItalicAndMore(): void {
    const btns = this.getButtons();
    this.editor.ui.registry.addSplitButton(ItalicWithMore, {
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
