export interface Feature {
  Description: string;
  Enabled: boolean;
  EnabledReason: string;
  EnabledReasonDetailed: string;
  EnabledStored: boolean;
  Expires: string;
  Guid: string;
  License: string;
  LicenseEnabled: boolean;
  Name: string;
  NameId: string;
  /** If this feature is to be shown in API calls for public users */
  Public: boolean;
  /** Is this feature security relevant */
  Security: FeatureSecurity;
  /** Does this feature apply to UIs (like the edit-form) */
  Ui: boolean;
}

export interface FeatureSecurity {
  /** Number from 0 - 5 to indicate how much it could impact security */
  Impact: number;
  /** Message how it could impact security */
  Message: string;
}

export interface FeatureState {
  FeatureGuid: string;
  Enabled: boolean | null;
}
