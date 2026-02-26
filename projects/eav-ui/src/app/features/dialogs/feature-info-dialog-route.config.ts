import { DialogConfig } from '../../shared/models/dialog-config.model';

export const featureInfoRouteDialog: DialogConfig = {
  name: 'FEATURE_INFO_ROUTE_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { FeatureInfoDialogRouteComponent } = await import('./feature-info-dialog-route');
    return FeatureInfoDialogRouteComponent;
  }
};