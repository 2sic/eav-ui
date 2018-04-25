import { Input } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { FieldConfig } from './field-config';

export interface ExternalFactory {
    name: string;
    host: any;
    options: any;
    initialize(host, options);
    render(container);
    externalChange(container, newValue);
}
