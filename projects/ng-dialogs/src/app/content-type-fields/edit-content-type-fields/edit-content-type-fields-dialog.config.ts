import { DialogConfig } from '../../shared/models/dialog-config.model';

export const editContentTypeFieldsDialog: DialogConfig = {
  name: 'EDIT_CONTENT_TYPE_FIELDS_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { EditContentTypeFieldsComponent } = await import('./edit-content-type-fields.component');
    return EditContentTypeFieldsComponent;
  }
};
