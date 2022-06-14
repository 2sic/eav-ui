import { DialogConfig } from '../../shared/models/dialog-config.model';

export const appsManagementDialog: DialogConfig = {
  name: 'APPS_MANAGEMENT_DIALOG',
  initContext: true,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { AppsManagementNavComponent } = await import('./apps-management-nav.component');
    return AppsManagementNavComponent;
  }
};
