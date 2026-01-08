export interface FeatureConfigSavePackage {
  FeatureGuid: string;
  Enabled: boolean | null;
  Configuration?: Record<string, unknown>;
}


// export interface OverrideContentsLogData {
//     LoadAppDetails: boolean | null;
//     LoadAppSummary: boolean | null;
//     LoadSystemDataDetails: boolean | null;
//     LoadSystemDataSummary: boolean | null;
// } 