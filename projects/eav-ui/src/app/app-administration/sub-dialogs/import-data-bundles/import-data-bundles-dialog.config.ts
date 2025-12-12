import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const importDataBundlesDialog: DialogConfig = {
  name: 'IMPORT_DATA_BUNDLES_DIALOG',
  initContext: false,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ImportDataBundlesComponent } = await import('./import-data-bundles');
    return ImportDataBundlesComponent;
  }
};
