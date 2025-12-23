import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const deleteExtensionDialog: DialogConfig = {
  name: 'DELETE_EXTENSION_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { DeleteExtensionComponent } = await import('./delete-extension');
    return DeleteExtensionComponent;
  }
};
