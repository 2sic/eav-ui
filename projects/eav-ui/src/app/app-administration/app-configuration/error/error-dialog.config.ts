import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const errorDialog: DialogConfig = {
  name: 'ERROR_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { ErrorComponent } = await import('./error.component');
    return ErrorComponent;
  }
};