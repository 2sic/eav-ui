import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const inspectExtensionDialog: DialogConfig = {
  name: 'INSPECT_EXTENSION_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { InspectExtensionComponent } = await import('./inspect-extension');
    return InspectExtensionComponent;
  }
};
