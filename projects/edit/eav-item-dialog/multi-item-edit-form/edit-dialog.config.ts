import { DialogConfig } from '../../../ng-dialogs/src/app/shared/models/dialog-config.model';
import { ITEMS_EDIT_DIALOG } from '../../../ng-dialogs/src/app/shared/constants/dialog-names';

export const editDialog: DialogConfig = {
  name: ITEMS_EDIT_DIALOG,
  initContext: true,
  panelSize: 'custom',
  panelClass: ['c-multi-item-dialog'],

  async getComponent() {
    const { MultiItemEditFormComponent } = await import('./multi-item-edit-form.component');
    return MultiItemEditFormComponent;
  }
};
