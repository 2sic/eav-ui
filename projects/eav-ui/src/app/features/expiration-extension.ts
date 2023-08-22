import { License } from '../apps-management/models/license.model';
import { Feature } from './models';

/**
 * Helper class used in union with other classes to add expiration hints to features.
 * It's implemented as a class, so it's easier to bundle static functions.
 */
export class ExpirationExtension {

  /** The expiration date as a human readable string. Not from the server; generated on the client */
  ExpMessage?: string;
  ExpIcon?: string;

  ExpWarningIcon?: string;

  static expandFeature(feature: Feature): Feature & ExpirationExtension {
    return {
      ...feature,
      ...ExpirationExtension.getExpiration(feature?.Expiration)
    };
  }

  static expandLicense(license: License): License & ExpirationExtension {
    // Wrap in Try-Catch to avoid errors in the UI
    try {
      // find the lowest expiration date on the features
      const lowestExpiration = license?.Features?.map(f => f.Expiration).sort()[0];
      // if there is no lowest expiration date, skip the rest
      if (lowestExpiration == null) return license;

      // debugger;
      const withState = {
        ...license,
        ...ExpirationExtension.getExpiration(lowestExpiration),
      };

      return withState;
    } catch (error) {
      return license;
    }
  }

  private static getExpiration(dateString: string): ExpirationExtension {
    // Inner helper to create the final result
    const result = (icon: string, text: string) => ({
      ExpMessage: (icon != null ? icon + ' ' : '') + text,
      ExpIcon: icon,
      ExpWarningIcon: icon != '✅' ? icon : null,
    })
    const expires = dateString?.split('T')[0];
    // no valid expiration date
    if (expires == null) return result(null, null);
    // never expires
    if (expires.startsWith('9999')) return result('✅', 'never');
    const expDate = new Date(expires);
    // show "expired" if it's over-due
    if (expDate < new Date()) return result('🛑', 'expired');
    // return "today" if it's today
    if (expDate.toDateString() === new Date().toDateString()) return result('⚠️', 'today');
    // return "tomorrow" if it's tomorrow
    if (expDate.toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()) return result('⚠️', 'tomorrow');
    // Warn if it's within 30 days
    if (expDate < new Date(new Date().setDate(new Date().getDate() + 30))) return result('⚠️', expires);
    // Show special EOY if it's at the end of the year - the most common expiration
    if (expires.endsWith('12-31')) return result('✅', `EOY ${expires.split('-')[0]}`);
    // otherwise: just show the date
    return result('❓', expires);
  }

}