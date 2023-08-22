import { FeatureSecurity, FeatureSummary } from '.';

/**
 * Feature information incl. activation state etc. provided by the server
 */
export interface Feature extends FeatureSummary {
  /** Internal GUID of the feature, usually not used */
  Guid: string;

  Description: string;
  EnabledReason: string;
  EnabledReasonDetailed: string;
  Enabled: boolean;
  EnabledByDefault: boolean;
  EnabledInConfiguration: boolean | null;
  Expiration: string;
  License: string;
  LicenseEnabled: boolean;
  /** If this feature is to be shown in API calls for public users */
  Public: boolean;
  /** Is this feature security relevant */
  Security: FeatureSecurity;
  /** Does this feature apply to UIs (like the edit-form) */
  Ui: boolean;
  Link: string;
}
