import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const basicMessageDialog: DialogConfig = {
  name: 'ERROR_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { BasicMessage } = await import('./basic-message');
    return BasicMessage;
  }
};
