import { AdamItem } from '../../../../../../../edit-types';
import { BaseFieldViewModel } from '../../fields/base/base-field-template-vars.model';
import { Preview } from '../../fields/hyperlink/hyperlink-default/hyperlink-default.models';

export interface HyperlinkDefaultExpandableTemplateVars extends BaseFieldViewModel {
  preview: Preview;
  buttonAdam: boolean;
  buttonPage: boolean;
  adamItem: AdamItem;
  enableImageConfiguration: boolean;
  showAdamSponsor: boolean;
}
