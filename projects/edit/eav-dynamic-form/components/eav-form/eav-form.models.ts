import { FormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../model/field-config';

export interface FormValueChange {
  form: FormGroup;
  fieldConfigs: FieldConfigSet[];
}
