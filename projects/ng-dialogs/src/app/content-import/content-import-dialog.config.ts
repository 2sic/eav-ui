import { DialogConfig } from '../shared/models/dialog-config.model';

export const contentImportDialog: DialogConfig = {
  name: 'IMPORT_CONTENT_TYPE_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ContentImportComponent } = await import('./content-import.component');
    return ContentImportComponent;
  }
};

export interface ContentImportDialogData {
  files?: File[];
}
