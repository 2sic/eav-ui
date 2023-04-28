import { BaseFieldViewModel } from '../../fields/base/base-field-template-vars.model';

export interface ExpandableWrapperTemplateVars extends BaseFieldViewModel {
  focused: boolean;
  previewHeight: PreviewHeight;
}

export interface PreviewHeight {
  minHeight: string;
  maxHeight: string;
}
