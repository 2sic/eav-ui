import { DialogConfig } from '../shared/models/dialog-config.model';

export const manageContentListDialog: DialogConfig = {
  name: 'MANAGE_CONTENT_LIST_DIALOG',
  initContext: true,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ManageContentListComponent } = await import('./manage-content-list.component');
    return ManageContentListComponent;
  }
};
