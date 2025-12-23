import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const inspectExtensionDialog: DialogConfig = {
  name: 'INSPECT_EXTENSION_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { InspectExtensionDialog } = await import('../inspect-dialog/inspect-extension-dialog');
    return InspectExtensionDialog;
  }
};
