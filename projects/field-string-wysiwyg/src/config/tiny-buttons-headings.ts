import { Ui } from 'tinymce';
import { HGroups } from './public';
import { ButtonsMakerParams, TinyButtonsBase } from './tiny-buttons-base';

export class TinyButtonsHeadings extends TinyButtonsBase {
  constructor(makerParams: ButtonsMakerParams) {
      super(makerParams);
  }

  register(): void {
    this.headingGroups1to4();
  }


  /** Group of buttons with an h3 to start and showing h4-6 + p */
  private headingGroups1to4(): void {
    const isGerman = this.editor.options.get('language') === 'de';
    const btns = this.getButtons();
    const blockquote = btns.blockquote;
    const imgName = isGerman ? 'custom-image-u' : 'custom-image-h';

    const HButtons = [
      this.splitButtonItem(`${imgName}1`, btns.h1.text, () => this.toggleFormat('h1')),
      this.splitButtonItem(`${imgName}2`, btns.h2.text, () => this.toggleFormat('h2')),
      this.splitButtonItem(`${imgName}3`, btns.h3.text, () => this.toggleFormat('h3')),
      this.splitButtonItem('custom-paragraph', 'Paragraph', () => this.toggleFormat('p')),
      this.splitButtonItem(`${imgName}4`, btns.h4.text, () => this.toggleFormat('h4')),
      this.splitButtonItem(`${imgName}5`, btns.h5.text, () => this.toggleFormat('h5')),
      this.splitButtonItem(`${imgName}6`, btns.h6.text, () => this.toggleFormat('h6')),
      this.splitButtonItem(blockquote.icon, blockquote.tooltip, () => this.toggleFormat('blockquote')),
    ];
    this.headingsGroup(HGroups.h1, 'h1', btns.h1 as Ui.Toolbar.ToolbarSplitButtonSpec, HButtons);
    this.headingsGroup(HGroups.h2, 'h2', btns.h2 as Ui.Toolbar.ToolbarSplitButtonSpec, HButtons);
    this.headingsGroup(HGroups.h3, 'h3', btns.h3 as Ui.Toolbar.ToolbarSplitButtonSpec, HButtons);
    this.headingsGroup(HGroups.h4, 'h4', btns.h4 as Ui.Toolbar.ToolbarSplitButtonSpec, HButtons);
  }

  private headingsGroup(
    groupName: string,
    mainFormat: string,
    button: Ui.Toolbar.ToolbarSplitButtonSpec,
    buttons: Ui.Menu.ChoiceMenuItemSpec[]
  ): void {
    this.editor.ui.registry.addSplitButton(groupName, {
      ...this.splitButtonSpecs(() => this.toggleFormat(mainFormat)),
      columns: 4,
      presets: 'listpreview',
      text: button.text,
      tooltip: button.tooltip,
      fetch: (callback) => { callback(buttons); },
    });
  }
}
