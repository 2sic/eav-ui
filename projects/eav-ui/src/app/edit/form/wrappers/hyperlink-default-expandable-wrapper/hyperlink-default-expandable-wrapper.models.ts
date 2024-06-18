import { AdamItem } from '../../../../../../../edit-types';
import { Preview } from '../../fields/hyperlink/hyperlink-default/hyperlink-default.models';

export interface HyperlinkDefaultExpandableViewModel {
  preview: Preview;
  buttonAdam: boolean;
  buttonPage: boolean;
  adamItem: AdamItem;
  enableImageConfiguration: boolean;
  showAdamSponsor: boolean;
}
