import { DialogConfig } from '../shared/models/dialog-config.model';

export const devRestDialog: DialogConfig = {
  name: 'DEV_REST_DIALOG',
  initContext: true,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { DevRestEntryComponent } = await import('./dev-rest-entry/entry.component');
    return DevRestEntryComponent;
  }
};
