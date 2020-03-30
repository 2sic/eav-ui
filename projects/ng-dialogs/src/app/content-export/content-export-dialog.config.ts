import { DialogConfig } from '../shared/models/dialog-config.model';

export const contentExportDialog: DialogConfig = {
  name: 'EXPORT_CONTENT_TYPE_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ContentExportComponent } = await import('./content-export.component');
    return ContentExportComponent;
  }
};
