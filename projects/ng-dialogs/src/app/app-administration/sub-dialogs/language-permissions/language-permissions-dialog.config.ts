import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const languagePermissionsDialog: DialogConfig = {
  name: 'LANGUAGE_PERMISSIONS',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { LanguagePermissionsComponent } = await import('./language-permissions.component');
    return LanguagePermissionsComponent;
  }
};
