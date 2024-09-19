/**
 * A brief summary about a feature / State etc.
 * It's provided in the context
 */
export interface FeatureSummary {
  /** Key / Name like EditUiGoogleTranslate */
  nameId: string;

  /** State if it is enabled or not */
  isEnabled: boolean;

  /** Allow the use of this, even if the feature is not enabled. In this case you'll typically see warnings. */
  allowUse: boolean;

  /** Nice name to show in any message or something */
  name: string;

  /** Behavior it should show when disabled */
  behavior: 'disable' | 'warn' | 'nag';
}
