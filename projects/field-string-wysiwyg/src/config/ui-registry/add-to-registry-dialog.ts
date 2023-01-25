import * as Buttons from '../../constants/buttons';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class TinyButtonsDialog extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
      super(makerParams);
  }

  register(): void {
    this.registerOpenDialog();
  }

  /** Switch to Dialog Mode */
  private registerOpenDialog(): void {
    this.regBtn(Buttons.DialogOpenButton, 'browse', 'SwitchMode.Expand', () => {
      this.openInDialog();
    });
  }
}
