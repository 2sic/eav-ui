import { DialogConfig } from '../../shared/models/dialog-config.model';

export const contentItemImportDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ContentItemImportComponent } = await import('./content-item-import.component');
    return ContentItemImportComponent;
  }
};
