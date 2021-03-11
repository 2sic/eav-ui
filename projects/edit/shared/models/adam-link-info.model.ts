import { AdamItem } from '../../../edit-types';

export interface AdamLinkInfo {
  /** Rich ADAM item with preview etc. (is null if the link was not able to resolve) */
  Adam: AdamItem;
  /** Just a string, in case the original link was not an ADAM or permissions didn't allow resolving */
  Value: string;
}
