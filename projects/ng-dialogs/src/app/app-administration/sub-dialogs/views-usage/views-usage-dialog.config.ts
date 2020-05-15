import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const viewsUsageDialog: DialogConfig = {
  name: 'VIEWS_USAGE_DIALOG',
  initContext: false,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { ViewsUsageComponent } = await import('./views-usage.component');
    return ViewsUsageComponent;
  }
};
