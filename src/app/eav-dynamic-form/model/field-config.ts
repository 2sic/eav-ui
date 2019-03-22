import { ValidatorFn } from '@angular/forms';
import { EavAttributes, EavAttributesTranslated, EavHeader } from '../../shared/models/eav';
import { AdamBrowserComponent } from '../../eav-material-controls/adam/browser/adam-browser.component';
import { Feature } from '../../shared/models/feature/feature';
import { EntityInfo } from '../../shared/models/eav/entity-info';

export interface FieldConfig {
    // transfer all field which are field specific to the fieldconfiguration class
    // rename FieldConfiguration to CurrentFieldConfig
    // and make currentfieldconfig be extended from fieldconfig
    // make new class ItemConfiguration with entityid, etc.
    // make new class/interface FormConfiguration for inputtypes, "all inputtypes" etc.
    currentFieldConfig?: CurrentFieldConfig;
    itemConfig?: ItemConfig;
    formConfig?: FormConfig;
}

export interface CurrentFieldConfig {
    disabled?: boolean;
    label?: string;
    name: string;
    options?: string[];
    placeholder?: string;
    inputType: string;
    isParentGroup?: boolean;
    type?: string;
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
    availableEntities?: EntityInfo[];
    enableCollapseField?: boolean;
    collapseField?: boolean;
}

export interface ItemConfig {
    entityId?: number;
    entityGuid?: string;
    header?: EavHeader;
}

export interface FormConfig {
    allInputTypeNames?: string[];
    features?: Feature[];
}
