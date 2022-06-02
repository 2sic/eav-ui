import { DialogConfig } from '../shared/models/dialog-config.model';

export const permissionsDialog: DialogConfig = {
  name: 'SET_PERMISSIONS_DIALOG',
  initContext: true,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { PermissionsComponent } = await import('./permissions.component');
    return PermissionsComponent;
  }
};
