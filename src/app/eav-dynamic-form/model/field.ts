import { Input } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { FieldConfigSet } from './field-config';

export interface Field {
    config: FieldConfigSet;
    group: FormGroup;
}
