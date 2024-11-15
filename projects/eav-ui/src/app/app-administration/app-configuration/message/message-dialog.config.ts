import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const messageDialog: DialogConfig = {
  name: 'ERROR_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { MessageComponent } = await import('./message.component');
    return MessageComponent;
  }
};