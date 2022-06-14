import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface ExternalWebComponentTemplateVars extends BaseFieldTemplateVars {
  loading: boolean;
  isExpanded: boolean;
}
