import { DialogConfig } from 'projects/eav-ui/src/app/shared/models/dialog-config.model';

export const dataBundlesDialog: DialogConfig = {
  name: 'Data Bundles Details',
  initContext: false,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { DataBundlesDetailComponent } = await import('./data-bundles-detail.component');
    return DataBundlesDetailComponent;
  }
};
