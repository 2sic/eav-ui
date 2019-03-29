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

// spm todo: move this to the entities- fields (in own file)
export interface EntityFieldConfigSet extends FieldConfigSet {
  cache: EntityInfo[];
}

// once fields are extracted, rename "FieldConfig" to "FieldConfigAngular"
// then rename "FieldConfigBase" to "FieldConfig"
export interface FieldConfig extends FieldConfigBase {
  // disabled?: boolean;
  // label?: string;
  // name: string;
  options?: string[]; // spm todo double check if this is used
  placeholder?: string; // spm move to base
  inputType: string; // spm move to base
  isParentGroup?: boolean; // spm todo extract to FieldConfigGroup
  // type?: string;
  validation?: ValidatorFn[];
  value?: any; // spm todo double check if this is used. Make sure to check boolean-default
  wrappers?: string[];
  required?: boolean; // spm move to base class
  // pattern?: string;
  settings?: EavAttributesTranslated;
  fullSettings?: EavAttributes;
  collapse?: boolean; // spm todo: remove, only use as local var in group
  fieldGroup?: FieldConfigSet[]; // spm todo extract to FieldConfigGroup
  // index?: number;
  // adam?: AdamBrowserComponent; // spm move from currentFieldConfig to FieldConfig as adam
  availableEntities?: EntityInfo[]; // spm move from currentFieldConfig to FieldConfig as cache
  enableCollapseField?: boolean; // spm todo: remove, only local var in content-block
  collapseField?: boolean; // spm todo: remove, only local var in content-block
}

export interface FieldConfigGroup extends FieldConfig {
  fieldGroup?: FieldConfigSet[];
  isParentGroup?: boolean;
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
