import { Input } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { FieldConfig } from './field-config';

export interface FieldExternal {
    config: FieldConfig;
    group: FormGroup;
    factory: any;
}
