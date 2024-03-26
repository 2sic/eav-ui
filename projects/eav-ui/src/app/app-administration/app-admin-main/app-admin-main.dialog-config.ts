import { DialogConfig } from '../../shared/models/dialog-config.model';

export const appAdministrationDialog: DialogConfig = {
  name: 'APP_ADMINISTRATION_DIALOG',
  initContext: true,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { AppAdminMainComponent } = await import('./app-admin-main.component');
    return AppAdminMainComponent;
  }
};
