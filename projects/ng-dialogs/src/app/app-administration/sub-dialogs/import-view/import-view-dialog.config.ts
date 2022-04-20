import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const importViewDialog: DialogConfig = {
  name: 'IMPORT_VIEW_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportViewComponent } = await import('./import-view.component');
    return ImportViewComponent;
  }
};
