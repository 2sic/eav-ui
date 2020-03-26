import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const editContentTypeDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { EditContentTypeComponent } = await import('./edit-content-type.component');
    return EditContentTypeComponent;
  }
};
