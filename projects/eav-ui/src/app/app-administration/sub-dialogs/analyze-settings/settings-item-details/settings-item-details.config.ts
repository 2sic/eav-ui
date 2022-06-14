import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const settingsItemDetailsDialog: DialogConfig = {
  name: 'SETTINGS_ITEM_DETAILS',
  initContext: false,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { SettingsItemDetailsComponent } = await import('./settings-item-details.component');
    return SettingsItemDetailsComponent;
  }
};
