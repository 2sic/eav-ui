import { Input } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { FieldConfig } from './field-config';

export interface Field {
    config: FieldConfig;
    group: FormGroup;
}
