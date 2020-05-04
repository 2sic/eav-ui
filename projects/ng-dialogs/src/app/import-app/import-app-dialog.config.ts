import { DialogConfig } from '../shared/models/dialog-config.model';

export const importAppDialog: DialogConfig = {
  name: 'IMPORT_APP_DIALOG',
  initContext: true,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportAppComponent } = await import('./import-app.component');
    return ImportAppComponent;
  }
};
