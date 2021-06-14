import { BaseFieldTemplateVars } from '../../../eav-material-controls/input-types/base/base-field-template-vars.model';
import { Preview } from '../../../eav-material-controls/input-types/hyperlink/hyperlink-default/hyperlink-default.models';

export interface HyperlinkDefaultExpandableTemplateVars extends BaseFieldTemplateVars {
  preview: Preview;
  buttonAdam: boolean;
  buttonPage: boolean;
}
