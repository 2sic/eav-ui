import { ValidatorFn } from '@angular/forms';
import { EavAttributes, EavAttributesTranslated, EavHeader } from '../../shared/models/eav';
import { AdamBrowserComponent } from '../../eav-material-controls/adam/browser/adam-browser.component';
import { Feature } from '../../shared/models/feature/feature';
import { EntityInfo } from '../../shared/models/eav/entity-info';
import { FieldConfig } from '../../../../projects/shared/field-config';

export interface FieldConfigSet {
  field?: FieldConfigAngular;
  entity?: ItemConfig;
  form?: FormConfig;
  adam?: AdamBrowserComponent;
  cache?: any;
}

// spm todo: move this to the entities- fields (in own file)
export interface EntityFieldConfigSet extends FieldConfigSet {
  cache: EntityInfo[];
}

export interface FieldConfigAngular extends FieldConfig {
  // disabled?: boolean;
  // label?: string;
  // name: string;
  options?: string[]; // spm todo double check if this is used
  // placeholder?: string; // spm move to base
  // inputType: string; // spm move to base
  // isParentGroup?: boolean; // spm todo extract to FieldConfigGroup
  // type?: string;
  validation?: ValidatorFn[];
  value?: any; // spm redo value check in boolean-default and maybe rename this to initialValue. It's only used to initialize controls
  wrappers?: string[];
  // required?: boolean; // spm move to base class
  // pattern?: string;
  settings?: EavAttributesTranslated;
  fullSettings?: EavAttributes;
  // collapse?: boolean; // spm todo: remove, only use as local var in group
  // fieldGroup?: FieldConfigSet[]; // spm todo extract to FieldConfigGroup
  // index?: number;
  // adam?: AdamBrowserComponent; // spm move from currentFieldConfig to FieldConfig as adam
  availableEntities?: EntityInfo[]; // spm move from currentFieldConfig to FieldConfig as cache
  enableCollapseField?: boolean; // spm todo: remove, only local var in content-block. Default to true
  collapseField?: boolean; // spm todo: remove, only local var in content-block. For content-block default to true
}

export interface FieldConfigGroup extends FieldConfigAngular {
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
