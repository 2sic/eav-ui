import { Injector } from '@angular/core';
import { FeaturesDisableAutoLoadService } from '../features/features-disable-autoload.service';
import { DialogConfig } from '../shared/models/dialog-config.model';

/**
 * Contains size definition and component reference for the edit dialog.
 */
export const editDialog: DialogConfig = {
  name: 'ITEMS_EDIT_DIALOG',
  initContext: true,
  panelSize: 'custom',
  panelClass: ['c-multi-item-dialog'],

  /**
   * Very special behavior - we need to be sure that the features-service does NOT auto-load the dialog-settings.
   * This is because the edit dialog may be opened by a user who doesn't have the necessary permissions.
   * @param injector 
   * @returns 
   */
  async getComponent(injector: Injector) {
    injector.get(FeaturesDisableAutoLoadService).disableAutoLoad = true

    const { EditEntryComponent } = await import('./dialog/entry/edit-entry');
    return EditEntryComponent;
  }
};
