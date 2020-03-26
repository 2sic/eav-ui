import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const contentImportDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ContentImportComponent } = await import('./content-import.component');
    return ContentImportComponent;
  }
};
