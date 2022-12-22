/**
 * A brief summary about a feature / State etc.
 * It's provided in the context
 */
export interface FeatureStatus {
  /** Key / Name like EditUiGoogleTranslate */
  NameId: string;
  /** State if it is enabled or not */
  Enabled: boolean;
  /** Nice name to show in any message or something */
  Name: string;
}
