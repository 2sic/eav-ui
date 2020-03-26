import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const importAppPartsDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportAppPartsComponent } = await import('./import-app-parts.component');
    return ImportAppPartsComponent;
  }
};
