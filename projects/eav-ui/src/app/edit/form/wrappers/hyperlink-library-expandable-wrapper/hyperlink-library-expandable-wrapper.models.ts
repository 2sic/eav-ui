import { AdamItem } from '../../../../../../../edit-types';
import { BaseFieldViewModel } from '../../fields/base/base-field-template-vars.model';

export interface HyperlinkLibraryExpandableTemplateVars extends BaseFieldViewModel {
  items: AdamItem[];
  itemsNumber: number;
  showAdamSponsor: boolean;
}
