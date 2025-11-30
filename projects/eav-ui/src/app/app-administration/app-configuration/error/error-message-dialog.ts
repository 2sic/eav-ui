import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const errorMessageDialog: DialogConfig = {
  name: 'ERROR_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { ErrorMessage } = await import('./error-message');
    return ErrorMessage;
  }
};