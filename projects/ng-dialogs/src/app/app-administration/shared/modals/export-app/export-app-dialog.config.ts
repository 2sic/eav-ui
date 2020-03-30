import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const exportAppDialog: DialogConfig = {
  name: 'EXPORT_APP',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ExportAppComponent } = await import('./export-app.component');
    return ExportAppComponent;
  }
};
