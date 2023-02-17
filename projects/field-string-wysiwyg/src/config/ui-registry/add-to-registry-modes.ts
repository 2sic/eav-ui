import * as Buttons from '../../constants/buttons';
import * as EditModes from '../../constants/edit-modes';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class TinyButtonsModes extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
    super(makerParams);
  }

  register(): void {
    this.addSwitchModeButtons();

    // experimental
    // this.addModes();
  }

  /** Switch normal / advanced mode */
  private addSwitchModeButtons(): void {
    this.regBtn(Buttons.ModeDefault, 'close', 'SwitchMode.Standard', () => {
      this.switchMode(null, EditModes.Default);
    });
    // this.editor.ui.registry.addButton(ToModeInline, {
    //   icon: 'close',
    //   tooltip: 'SwitchMode.Standard',
    //   onAction: (api) => { this.switchModeNew(WysiwygDefault, WysiwygInline); },
    // });
    this.regBtn(Buttons.ModeAdvanced, 'custom-school', 'SwitchMode.Pro', () => {
      this.switchMode(null, EditModes.WysiwygAdvanced);
    });
  }

}
