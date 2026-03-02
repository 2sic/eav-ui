import * as Buttons from '../../constants/buttons';
import { AddToRegistryBase } from './add-to-registry-base';
import { AddToRegistryParams } from './add-to-registry-params';

export class TinyButtonsDialog extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
      super(makerParams);
  }

  register(): void {
    this.registerOpenDialog();
  }

  /** Switch to Dialog Mode */
  private registerOpenDialog(): void {
    this.regBtn(Buttons.DialogOpen, 'browse', 'SwitchMode.Expand', () => {
      this.openInDialog();
    });
  }
}
