import { DialogConfig } from '../../shared/models/dialog-config.model';

export const featureInfoDialog: DialogConfig = {
  name: 'FEATURE_INFO_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { FeatureInfoDialogComponent } = await import('./feature-info-dialog.component');
    return FeatureInfoDialogComponent;
  }
};