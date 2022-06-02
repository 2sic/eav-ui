import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const importContentTypeDialog: DialogConfig = {
  name: 'IMPORT_CONTENT_TYPE_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportContentTypeComponent } = await import('./import-content-type.component');
    return ImportContentTypeComponent;
  }
};
