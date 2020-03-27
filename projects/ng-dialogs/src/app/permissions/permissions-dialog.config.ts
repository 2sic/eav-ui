import { DialogConfig } from '../shared/models/dialog-config.model';

export const permissionsDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { PermissionsComponent } = await import('./permissions.component');
    return PermissionsComponent;
  }
};
