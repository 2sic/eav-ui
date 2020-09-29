import { ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfigSet } from './field-config';

export interface FieldWrapper {
  fieldComponent: ViewContainerRef;
  config: FieldConfigSet;
  group: FormGroup;
}
