import { BaseFieldViewModel } from '../../base/base-field-template-vars.model';

export interface BooleanDefaultViewModel extends BaseFieldViewModel {
  checked: boolean;
  changable: boolean;
}
