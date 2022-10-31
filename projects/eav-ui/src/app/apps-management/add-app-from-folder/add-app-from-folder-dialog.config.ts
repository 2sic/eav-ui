import { DialogConfig } from '../../shared/models/dialog-config.model';

export const addAppFromFolderDialog: DialogConfig = {
  name: 'ADD_FROM_FOLDER_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { AddAppFromFolderComponent } = await import('./add-app-from-folder.component');
    return AddAppFromFolderComponent;
  }
};
