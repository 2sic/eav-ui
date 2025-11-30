import { DialogConfig } from '../../shared/models/dialog-config.model';

export const appAdminDialog: DialogConfig = {
  name: 'APP_ADMINISTRATION_DIALOG',
  initContext: true,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { AppAdminMain } = await import('./app-admin-main');
    return AppAdminMain;
  }
};
