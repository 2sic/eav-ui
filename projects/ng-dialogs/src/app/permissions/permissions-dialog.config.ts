import { DialogConfig } from '../shared/models/dialog-config.model';

export const permissionsDialog: DialogConfig = {
  name: 'SET_PERMISSIONS_DIALOG',
  initContext: false,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { PermissionsComponent } = await import('./permissions.component');
    return PermissionsComponent;
  }
};
