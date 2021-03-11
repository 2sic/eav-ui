import { AdamItem } from '../../../edit-types';

export interface LinkInfo {
  /** Null if URL doesn't resolve to ADAM file (is page, external url or blocked by permissions) */
  Adam?: AdamItem;
  /** Resolved or original URL */
  Value: string;
}
