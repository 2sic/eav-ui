import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const exportAppPartsDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'medium',
  panelClass: ['show-scrollbar'],

  async getComponent() {
    const { ExportAppPartsComponent } = await import('./export-app-parts.component');
    return ExportAppPartsComponent;
  }
};
