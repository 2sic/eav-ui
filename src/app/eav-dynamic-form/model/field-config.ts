import { ValidatorFn } from '@angular/forms';
import { EavAttributes, EavAttributesTranslated } from '../../shared/models/eav';

export interface FieldConfig {
    entityId?: number;
    disabled?: boolean;
    label?: string;
    name: string;
    options?: string[];
    placeholder?: string;
    type: string;
    validation?: ValidatorFn[];
    value?: any;

    wrappers?: string[];

    required?: boolean;
    // pattern?: string;
    // settings?: EavAttributes;
    settings?: EavAttributesTranslated;
    collapse?: boolean;

    fieldGroup?: FieldConfig[];
}
