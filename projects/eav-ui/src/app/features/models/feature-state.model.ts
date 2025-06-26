export interface FeatureState {
  FeatureGuid: string;
  Enabled: boolean | null;
  Configuration?: {
    LoadAppDetails: boolean,
    LoadAppSummary: boolean,
    LoadSystemDataDetails: boolean,
    LoadSystemDataSummary: boolean,
  }
}

// 