import { UntypedFormGroup } from '@angular/forms';
import { FieldConfigSet, FieldControlConfig } from './field-config-set.model';

export interface Field {
  config: FieldConfigSet;
  controlConfig: FieldControlConfig;
  group: UntypedFormGroup;
}
