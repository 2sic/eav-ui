import { ViewContainerRef } from '@angular/core';
import { Field } from './field.model';

export interface FieldWrapper extends Field {
  fieldComponent: ViewContainerRef;
}
