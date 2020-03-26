import { DialogConfig } from '../../../ng-dialogs/src/app/shared/models/dialog-config.model';

export const editDialogConfig: DialogConfig = {
  // this is module root dialog and has to init context
  initContext: true,
  panelSize: 'custom',
  panelClass: ['c-multi-item-dialog'],

  async getComponent() {
    const { MultiItemEditFormComponent } = await import('./multi-item-edit-form.component');
    return MultiItemEditFormComponent;
  }
};
