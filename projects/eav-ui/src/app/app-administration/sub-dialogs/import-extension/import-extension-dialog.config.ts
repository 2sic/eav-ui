import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const importExtensionDialog: DialogConfig = {
  name: 'IMPORT_EXTENSION_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportExtensionComponent } = await import('./import-extension.component');
    return ImportExtensionComponent;
  }
};
