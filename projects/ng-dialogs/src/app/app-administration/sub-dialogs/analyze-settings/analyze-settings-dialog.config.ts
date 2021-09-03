import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const analyzeSettingsDialog: DialogConfig = {
  name: 'ANALYZE_SETTINGS',
  initContext: false,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { AnalyzeSettingsComponent } = await import('./analyze-settings.component');
    return AnalyzeSettingsComponent;
  }
};
