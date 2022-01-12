export interface Feature {
  /** Description of this feature, can contain HTML */
  Description: string;
  /** Determines if the feature is enabled */
  Enabled: boolean;
  /** Expiry date of this feature */
  Expires: string;
  /** Global ID of this feature */
  Guid: string;
  /** Nice name of this feature */
  Name: string;
  /** Name identifier for this feature */
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
