import { DialogConfig } from '../../shared/models/dialog-config.model';

export const createInheritedAppDialog: DialogConfig = {
  name: 'CREATE_INHERITED_APP_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { CreateInheritedAppComponent } = await import('./create-inherited-app.component');
    return CreateInheritedAppComponent;
  }
};
