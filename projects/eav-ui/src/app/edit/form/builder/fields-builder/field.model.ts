import { UntypedFormGroup } from '@angular/forms';
import { FieldConfigSet, FieldControlConfig } from './field-config-set.model';

// TODO: @2dm 2024-06-20 - check this, very similar to FieldState
export interface Field {
  config: FieldConfigSet;
  controlConfig: FieldControlConfig;
  group: UntypedFormGroup;
}
