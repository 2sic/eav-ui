import { DialogConfig } from '../shared/models/dialog-config.model';

export const devRestDialog: DialogConfig = {
  name: 'DEV_REST_DIALOG',
  initContext: true,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { DevRestComponent } = await import('./dev-rest-data/dev-rest-data.component');
    return DevRestComponent;
  }
};
