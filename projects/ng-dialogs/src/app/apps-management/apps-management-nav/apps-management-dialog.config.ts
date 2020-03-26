import { DialogConfig } from '../../shared/models/dialog-config.model';

export const appsManagementDialogConfig: DialogConfig = {
  // this is module root dialog and has to init context
  initContext: true,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { AppsManagementNavComponent } = await import('./apps-management-nav.component');
    return AppsManagementNavComponent;
  }
};
