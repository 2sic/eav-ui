import { DialogConfig } from '../../shared/models/dialog-config.model';

export const importContentItemDialog: DialogConfig = {
  name: 'IMPORT_CONTENT_ITEM_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportContentItemComponent: ImportContentItemComponent } = await import('./import-content-item.component');
    return ImportContentItemComponent;
  }
};
