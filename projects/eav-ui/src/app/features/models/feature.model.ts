import { FeatureSecurity, FeatureSummary } from '.';

/**
 * Feature information incl. activation state etc. provided by the server
 */
export interface Feature extends FeatureSummary {
  /** Internal GUID of the feature, usually not used */
  guid: string;

  description: string;
  enabledReason: string;
  enabledReasonDetailed: string;
  enabledByDefault: boolean;
  enabledInConfiguration: boolean | null;
  expiration: string;
  configurationContentType?: string;

  // License: string;
  // LicenseEnabled: boolean;

  /** If this feature is to be shown in API calls for public users */
  // Public: boolean;

  /** Is this feature security relevant */
  security: FeatureSecurity;
  /** Does this feature apply to UIs (like the edit-form) */
  // Ui: boolean;

  link: string;

  /** Allow configuration in UI - if false, the user can't enable/disable it */
  isConfigurable: boolean;
}
