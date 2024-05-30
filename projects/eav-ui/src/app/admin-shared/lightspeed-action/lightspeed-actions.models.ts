import { App } from '../../apps-management/models/app.model';

export interface LightSpeedActionsParams {
  onOpenLightspeed(app: unknown): void;
  // lightspeedEnabled(): boolean;
  openLightspeedFeatureInfo(): void;
}
