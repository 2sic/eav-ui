import { ViewContainerRef, Input } from '@angular/core';
import { Field } from './field';
import { FieldConfigSet } from './field-config';
import { FormGroup } from '@angular/forms';

export interface FieldWrapper {
    fieldComponent: ViewContainerRef;
    config: FieldConfigSet;
}
