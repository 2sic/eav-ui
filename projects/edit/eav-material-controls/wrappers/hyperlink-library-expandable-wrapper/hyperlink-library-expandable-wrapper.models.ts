import { AdamItem } from '../../../../edit-types';
import { BaseFieldTemplateVars } from '../../input-types/base/base-field-template-vars.model';

export interface HyperlinkLibraryExpandableTemplateVars extends BaseFieldTemplateVars {
  value: null;
  label: string;
  required: boolean;
  invalid: boolean;
  items: AdamItem[];
  itemsNumber: number;
}
