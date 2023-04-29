import { BaseFieldViewModel } from '../../base/base-field-template-vars.model';

export interface ExternalWebComponentViewModel extends BaseFieldViewModel {
  loading: boolean;
  isExpanded: boolean;
}
