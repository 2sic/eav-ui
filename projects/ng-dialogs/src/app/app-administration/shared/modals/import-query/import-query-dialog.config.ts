import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const importQueryDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportQueryComponent } = await import('./import-query.component');
    return ImportQueryComponent;
  }
};
