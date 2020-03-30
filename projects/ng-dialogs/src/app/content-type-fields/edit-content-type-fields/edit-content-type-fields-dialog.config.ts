import { DialogConfig } from '../shared/models/dialog-config.model';

export const editContentTypeFieldsDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { EditContentTypeFieldsComponent } = await import('./edit-content-type-fields.component');
    return EditContentTypeFieldsComponent;
  }
};
