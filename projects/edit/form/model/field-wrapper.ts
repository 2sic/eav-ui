import { ViewContainerRef } from '@angular/core';
import { Field } from './field';

export interface FieldWrapper extends Field {
  fieldComponent: ViewContainerRef;
}
