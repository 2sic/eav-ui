import { DialogConfig } from '../shared/models/dialog-config.model';

/**
 * Contains size definition and component reference for the edit dialog.
 */
export const editDialog: DialogConfig = {
  name: 'ITEMS_EDIT_DIALOG',
  initContext: true,
  panelSize: 'custom',
  panelClass: ['c-multi-item-dialog'],

  async getComponent() {
    const { EditEntryComponent } = await import('./dialog/entry/edit-entry.component');
    return EditEntryComponent;
  }
};
