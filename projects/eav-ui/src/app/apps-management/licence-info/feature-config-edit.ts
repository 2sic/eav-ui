
export interface FeatureConfigEdit {
  guid: string;
  enabled: boolean;

  /** Any other keys as you need */
  [key: string]: unknown;
}
