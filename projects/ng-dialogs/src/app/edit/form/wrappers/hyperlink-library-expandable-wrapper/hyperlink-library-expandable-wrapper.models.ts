import { AdamItem } from '../../../../../../../edit-types';
import { BaseFieldTemplateVars } from '../../fields/base/base-field-template-vars.model';

export interface HyperlinkLibraryExpandableTemplateVars extends BaseFieldTemplateVars {
  items: AdamItem[];
  itemsNumber: number;
  showAdamSponsor: boolean;
}
