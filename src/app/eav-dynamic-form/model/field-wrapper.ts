import { ViewContainerRef } from '@angular/core';
import { Field } from './field.interface';

export abstract class FieldWrapper {
    fieldComponent: ViewContainerRef;
}
