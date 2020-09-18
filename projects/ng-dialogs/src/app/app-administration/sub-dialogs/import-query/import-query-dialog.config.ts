import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const importQueryDialog: DialogConfig = {
  name: 'IMPORT_QUERY_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportQueryComponent } = await import('./import-query.component');
    return ImportQueryComponent;
  }
};

export interface ImportQueryDialogData {
  files?: FileList;
}
