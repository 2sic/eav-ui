import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const editContentTypeDialog: DialogConfig = {
  name: 'EDIT_CONTENT_TYPE_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { EditContentTypeComponent } = await import('./edit-content-type.component');
    return EditContentTypeComponent;
  }
};
