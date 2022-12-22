import { FeatureSecurity, FeatureStatus } from '.';


export interface Feature extends FeatureStatus {
  /** Internal GUID of the feature, usually not used */
  Guid: string;

  Description: string;
  EnabledReason: string;
  EnabledReasonDetailed: string;
  EnabledStored: boolean;
  Expires: string;
  License: string;
  LicenseEnabled: boolean;
  /** If this feature is to be shown in API calls for public users */
  Public: boolean;
  /** Is this feature security relevant */
  Security: FeatureSecurity;
  /** Does this feature apply to UIs (like the edit-form) */
  Ui: boolean;
}
