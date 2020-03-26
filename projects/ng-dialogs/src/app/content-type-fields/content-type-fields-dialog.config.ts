import { DialogConfig } from '../shared/models/dialog-config.model';

export const contentTypeFieldsDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { ContentTypeFieldsComponent } = await import('./content-type-fields.component');
    return ContentTypeFieldsComponent;
  }
};
