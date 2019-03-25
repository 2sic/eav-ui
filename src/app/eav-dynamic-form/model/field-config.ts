import { ValidatorFn } from '@angular/forms';
import { EavAttributes, EavAttributesTranslated, EavHeader } from '../../shared/models/eav';
import { AdamBrowserComponent } from '../../eav-material-controls/adam/browser/adam-browser.component';
import { Feature } from '../../shared/models/feature/feature';
import { EntityInfo } from '../../shared/models/eav/entity-info';
import { FieldConfigBase } from '../../../../projects/shared/field-config-base';

export interface FieldConfigSet {
    field?: FieldConfig;
    entity?: ItemConfig;
    form?: FormConfig;
    adam?: AdamBrowserComponent;
    cache?: any;
}

// todo: move this to the entities- fields (in own file)
export interface EntityFieldConfigSet extends FieldConfigSet {
    cache: EntityInfo[];
}

export interface FieldConfig extends FieldConfigBase {
    // disabled?: boolean;
    // label?: string;
    // name: string;
    options?: string[];
    placeholder?: string;
    inputType: string;
    isParentGroup?: boolean;
    // type?: string;
    validation?: ValidatorFn[];
    value?: any;
    wrappers?: string[];
    required?: boolean;
    // pattern?: string;
    settings?: EavAttributesTranslated;
    fullSettings?: EavAttributes;
    collapse?: boolean;
    fieldGroup?: FieldConfigSet[];
    // index?: number;
    // adam?: AdamBrowserComponent; // move from currentFieldConfig to FieldConfig as adam
    availableEntities?: EntityInfo[]; // move from currentFieldConfig to FieldConfig as cache
    enableCollapseField?: boolean;
    collapseField?: boolean;
}

export interface ItemConfig {
    entityId?: number;
    entityGuid?: string;
    header?: EavHeader;
}

export interface FormConfig {
    allInputTypeNames?: string[]; // should be changed!!!
    features?: Feature[];
}
