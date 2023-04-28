import { BaseFieldViewModel } from '../../base/base-field-template-vars.model';

export interface BooleanTristateViewModel extends BaseFieldViewModel {
  checked: boolean | '';
  changable: boolean;
}
