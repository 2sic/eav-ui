import { DialogConfig } from '../shared/models/dialog-config.model';

export const contentExportDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ContentExportComponent } = await import('./content-export.component');
    return ContentExportComponent;
  }
};
