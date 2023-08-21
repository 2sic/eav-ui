import { FeatureSecurity, FeatureSummary } from '.';


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

export interface FeatureWithUi extends Feature {
  ExpirationText: string;
}

export function expandFeatureWithUiInfo(feature: Feature): FeatureWithUi {
  const withState = {...feature} as FeatureWithUi;
  withState.ExpirationText = showExpiration(feature);
  return withState;
}

function showExpiration(feature: Feature): string {
  const expires = (feature as Feature)?.Expiration?.split('T')[0];
  if (expires == null) return null;
  if (expires.startsWith('9999')) return '✅ never';
  const expDate = new Date(expires);
  // show "expired" if it's over-due
  if (expDate < new Date()) return '🛑 expired';
  // return "today" if it's today
  if (expDate.toDateString() === new Date().toDateString()) return '⚠️ today';
  // return "tomorrow" if it's tomorrow
  if (expDate.toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()) return '⚠️ tomorrow';
  // Warn if it's within 30 days
  if (expDate < new Date(new Date().setDate(new Date().getDate() + 30))) return `⚠️ ${expires}`;
  // Show special EOY if it's at the end of the year - the most common expiration
  if (expires.endsWith('12-31')) return `✅ EOY ${expires.split('-')[0]}`;
  // otherwise: just show the date
  return `❓${expires}`;
}