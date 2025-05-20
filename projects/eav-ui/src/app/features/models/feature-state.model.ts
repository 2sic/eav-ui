export interface FeatureState {
  FeatureGuid: string;
  Enabled: boolean | null;
}

export interface FeatureConfig {
  FeatureGuid: string;
  Configuration: {
    LoadAppDetails: boolean,
    LoadAppSummary: boolean,
    LoadSystemDataDetails: boolean,
    LoadSystemDataSummary: boolean,
  }
}