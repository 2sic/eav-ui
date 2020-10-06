import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const devRestDialog: DialogConfig = {
  name: 'DEV_REST_DIALOG',
  initContext: true,
  panelSize: 'fullscreen',
  panelClass: null,

  async getComponent() {
    const { DevRestComponent } = await import('./dev-rest.component');
    return DevRestComponent;
  }
};
