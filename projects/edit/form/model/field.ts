import { FormGroup } from '@angular/forms';
import { FieldConfigSet } from './field-config';

export interface Field {
  config: FieldConfigSet;
  group: FormGroup;
}
