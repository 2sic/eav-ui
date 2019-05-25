import { Input } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { FieldConfigSet } from './field-config';

export interface FieldExternal {
    config: FieldConfigSet;
    group: FormGroup;
    factory: any;
}
