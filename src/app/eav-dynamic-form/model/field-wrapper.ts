import { ViewContainerRef, Input } from '@angular/core';
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';
import { FormGroup } from '@angular/forms';

export abstract class FieldWrapper {
    fieldComponent: ViewContainerRef;
    config: FieldConfig;
    group: FormGroup;
}
