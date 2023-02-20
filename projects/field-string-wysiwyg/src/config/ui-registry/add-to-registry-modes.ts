import * as Buttons from '../../constants/buttons';
import * as EditModes from '../../constants/edit-modes';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class TinyButtonsModes extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
    super(makerParams);
  }

  register(): void {
    this.addSwitchModeButtons();
  }

  /** Switch normal / advanced mode */
  private addSwitchModeButtons(): void {
    this.regBtn(Buttons.ModeDefault, 'close', 'SwitchMode.Standard', () => {

      const initialMode = this.options.configManager.getInitialMode();
      this.switchMode(null, initialMode);
    });

    this.regBtn(Buttons.ModeAdvanced, 'custom-school', 'SwitchMode.Pro', () => {
      this.switchMode(null, EditModes.WysiwygAdvanced);
    });
  }

}
