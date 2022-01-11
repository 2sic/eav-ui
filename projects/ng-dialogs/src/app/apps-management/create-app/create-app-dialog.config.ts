import { DialogConfig } from '../../shared/models/dialog-config.model';

export const createAppDialog: DialogConfig = {
  name: 'CREATE_APP_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { CreateAppComponent } = await import('./create-app.component');
    return CreateAppComponent;
  }
};
