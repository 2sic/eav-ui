export interface LightSpeedActionsParams {
  onOpenLightspeed(app: unknown): void;
  openLightspeedFeatureInfo(): void;
  lightSpeedLink?: (app: unknown) => string;
}
