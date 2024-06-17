import { UntypedFormGroup } from '@angular/forms';
import { FieldConfigSet, FieldControlConfig } from './field-config-set.model';
import { InputSignal } from '@angular/core';

export interface Field {
  config: FieldConfigSet;
  controlConfig: FieldControlConfig;
  group: UntypedFormGroup;
}


export interface FieldControlWithSignals {
  config: InputSignal<FieldConfigSet>;
  controlConfig: InputSignal<FieldControlConfig>;
  group: InputSignal<UntypedFormGroup>;
}