import { Input } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { TotalConfiguration, FieldConfig } from './field-config';

export interface Field {
    config: FieldConfig;
    group: FormGroup; // ??

    // fieldConfig: any; // todo
    // itemConfig: any; // todo
    // formConfig: any; // todo
}
