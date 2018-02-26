import { FormGroup } from '@angular/forms';
import { FieldConfig } from './field-config.interface';
import { TypeOption } from './type-option.interface';

export interface Field {
    config: FieldConfig,
    group: FormGroup
}
