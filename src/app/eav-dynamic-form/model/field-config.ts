import { ValidatorFn } from '@angular/forms';
import { EavAttributes, EavAttributesTranslated, EavHeader } from '../../shared/models/eav';
import { AdamBrowserComponent } from '../../eav-material-controls/adam/browser/adam-browser.component';

export interface FieldConfig {
    entityId?: number;
    header?: EavHeader;
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
    settings?: EavAttributesTranslated;
    fullSettings?: EavAttributes;
    collapse?: boolean;
    fieldGroup?: FieldConfig[];
    index?: number;
    adam?: AdamBrowserComponent;
}
