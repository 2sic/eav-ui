import { FormGroup } from '@angular/forms';
import { FieldConfigSet } from './field-config-set.model';

export interface Field {
  config: FieldConfigSet;
  group: FormGroup;
}
