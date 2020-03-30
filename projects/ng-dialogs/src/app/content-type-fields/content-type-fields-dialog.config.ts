import { DialogConfig } from '../shared/models/dialog-config.model';

export const contentTypeFieldsDialog: DialogConfig = {
  name: 'CONTENT_TYPE_FIELDS_DIALOG',
  initContext: false,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { ContentTypeFieldsComponent } = await import('./content-type-fields.component');
    return ContentTypeFieldsComponent;
  }
};
