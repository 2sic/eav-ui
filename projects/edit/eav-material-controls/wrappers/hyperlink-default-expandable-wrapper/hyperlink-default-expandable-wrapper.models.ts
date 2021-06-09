import { BaseFieldTemplateVars } from '../../input-types/base/base-field-template-vars.model';
import { Preview } from '../../input-types/hyperlink/hyperlink-default/hyperlink-default.models';

export interface HyperlinkDefaultExpandableTemplateVars extends BaseFieldTemplateVars {
  preview: Preview;
  buttonAdam: boolean;
  buttonPage: boolean;
}
