import { DialogConfig } from '../../shared/models/dialog-config.model';

export const contentItemImportDialog: DialogConfig = {
  name: 'IMPORT_CONTENT_ITEM_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ContentItemImportComponent } = await import('./content-item-import.component');
    return ContentItemImportComponent;
  }
};

export interface ContentItemImportDialogData {
  files?: File[];
}
