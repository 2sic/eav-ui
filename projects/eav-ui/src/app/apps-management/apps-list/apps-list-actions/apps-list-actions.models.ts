import { App } from '../../models/app.model';

export interface AppsListActionsParams {
  onDelete(app: App): void;
  onFlush(app: App): void;
  onOpenLightspeed(app: App): void;
  lightspeedEnabled(): boolean;
  openLightspeedFeatureInfo(): void;
}
