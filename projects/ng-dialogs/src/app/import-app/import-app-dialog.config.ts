import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const importAppDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportAppComponent } = await import('./import-app.component');
    return ImportAppComponent;
  }
};
