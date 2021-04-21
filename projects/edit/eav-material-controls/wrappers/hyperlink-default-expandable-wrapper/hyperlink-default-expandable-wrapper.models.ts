import { BaseFieldTemplateVars } from '../../input-types/base/base-field-template-vars.model';
import { Preview } from '../../input-types/hyperlink/hyperlink-default/hyperlink-default.models';

export interface HyperlinkDefaultExpandableTemplateVars extends BaseFieldTemplateVars {
  value: string;
  preview: Preview;
  label: string;
  placeholder: string;
  invalid: boolean;
  required: boolean;
  adamButton: boolean;
  pageButton: boolean;
}
