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
    this.editor.ui.registry.addButton(Buttons.DialogOpenButton, {
      icon: 'browse',
      tooltip: 'SwitchMode.Expand',
      onAction: (api) => { this.openInDialog(); },
    });
  }
}
