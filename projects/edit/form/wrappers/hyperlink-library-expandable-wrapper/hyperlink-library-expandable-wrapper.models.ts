import { AdamItem } from '../../../../edit-types';
import { BaseFieldTemplateVars } from '../../../eav-material-controls/input-types/base/base-field-template-vars.model';

export interface HyperlinkLibraryExpandableTemplateVars extends BaseFieldTemplateVars {
  items: AdamItem[];
  itemsNumber: number;
}
