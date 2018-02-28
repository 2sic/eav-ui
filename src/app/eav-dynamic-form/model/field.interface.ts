import { Input } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { FieldConfig } from './field-config.interface';
import { TypeOption } from './type-option.interface';

export declare abstract class Field {
    config: FieldConfig;
    group: FormGroup;

    //readonly formControl: AbstractControl;
    // readonly showError: boolean;
    // readonly id: string;
    //readonly formState: any;
}
