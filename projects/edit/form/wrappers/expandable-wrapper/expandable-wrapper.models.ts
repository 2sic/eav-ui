import { BaseFieldTemplateVars } from '../../fields/base/base-field-template-vars.model';

export interface ExpandableWrapperTemplateVars extends BaseFieldTemplateVars {
  focused: boolean;
  previewMinHeight: string;
}
