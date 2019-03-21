import { ValidatorFn } from '@angular/forms';
import { EavAttributes, EavAttributesTranslated, EavHeader } from '../../shared/models/eav';
import { AdamBrowserComponent } from '../../eav-material-controls/adam/browser/adam-browser.component';
import { Feature } from '../../shared/models/feature/feature';
import { EntityInfo } from '../../shared/models/eav/entity-info';

export interface TotalConfiguration {
    fieldConfig: FieldConfig;
    itemConfig: ItemConfig;
    formConfig: FormConfig;
}

export interface FieldConfig {
    // transfer all field which are field specific to the fieldconfiguration class
    // rename FieldConfiguration to CurrentFieldConfig
    // and make currentfieldconfig be extended from fieldconfig
    // make new class ItemConfiguration with entityid, etc.
    // make new class/interface FormConfiguration for inputtypes, "all inputtypes" etc.
    entityId?: number;
    entityGuid?: string;
    header?: EavHeader;
    disabled?: boolean; // fieldConfig
    label?: string; // fieldConfig
    name: string; // fieldConfig
    options?: string[];
    placeholder?: string; // fieldConfig
    inputType: string; // fieldConfig
    allInputTypeNames?: string[];
    isParentGroup?: boolean; // fieldConfig
    type?: string; // fieldConfig
    validation?: ValidatorFn[]; // fieldConfig
    value?: any; // fieldConfig
    wrappers?: string[]; // fieldConfig
    required?: boolean; // fieldConfig
    // pattern?: string;
    settings?: EavAttributesTranslated;
    fullSettings?: EavAttributes;
    collapse?: boolean; // fieldConfig
    fieldGroup?: FieldConfig[];
    index?: number;
    adam?: AdamBrowserComponent;
    features?: Feature[];
    availableEntities?: EntityInfo[];
    enableCollapseField?: boolean;
    collapseField?: boolean;
}

export interface ItemConfig {
    placeholder?: any;
}

export interface FormConfig {
    placeholder?: any;
}
