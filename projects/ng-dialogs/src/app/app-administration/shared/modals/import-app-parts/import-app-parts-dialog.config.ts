import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const importAppPartsDialog: DialogConfig = {
  name: 'IMPORT_APP_PARTS',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportAppPartsComponent } = await import('./import-app-parts.component');
    return ImportAppPartsComponent;
  }
};
