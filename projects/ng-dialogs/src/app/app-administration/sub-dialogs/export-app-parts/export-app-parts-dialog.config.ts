import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const exportAppPartsDialog: DialogConfig = {
  name: 'EXPORT_APP_PARTS',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ExportAppPartsComponent } = await import('./export-app-parts.component');
    return ExportAppPartsComponent;
  }
};
