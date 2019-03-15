import { ValidatorFn } from '@angular/forms';
import { EavAttributes, EavAttributesTranslated, EavHeader } from '../../shared/models/eav';
import { AdamBrowserComponent } from '../../eav-material-controls/adam/browser/adam-browser.component';
import { Feature } from '../../shared/models/feature/feature';
import { EntityInfo } from '../../shared/models/eav/entity-info';
import { FieldConfiguration } from '../../../../projects/shared/field-config';

export interface FieldConfig extends FieldConfiguration {
    entityId?: number;
    entityGuid?: string;
    header?: EavHeader;
    disabled?: boolean;
    label?: string;
    name: string;
    options?: string[];
    placeholder?: string;
    inputType: string;
    allInputTypeNames?: string[];
    isParentGroup?: boolean;
    type?: string;
    validation?: ValidatorFn[];
    // value?: any;
    wrappers?: string[];
    required?: boolean;
    // pattern?: string;
    settings?: EavAttributesTranslated;
    fullSettings?: EavAttributes;
    collapse?: boolean;
    fieldGroup?: FieldConfig[];
    index?: number;
    adam?: AdamBrowserComponent;
    features?: Feature[];
    availableEntities?: EntityInfo[];
    enableCollapseField?: boolean;
    collapseField?: boolean;
}
