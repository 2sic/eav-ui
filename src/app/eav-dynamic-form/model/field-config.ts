import { ValidatorFn } from '@angular/forms';
import { EavAttributes, EavAttributesTranslated, EavHeader } from '../../shared/models/eav';
import { AdamBrowserComponent } from '../../eav-material-controls/adam/browser/adam-browser.component';
import { Feature } from '../../shared/models/feature/feature';
import { FieldConfig } from '../../../../projects/shared/field-config';

export interface FieldConfigSet {
  field?: FieldConfigAngular;
  entity?: ItemConfig;
  form?: FormConfig;
  adam?: AdamBrowserComponent;
  cache?: any;
}

export interface FieldConfigAngular extends FieldConfig {
  validation?: ValidatorFn[];
  initialValue?: any;
  wrappers?: string[];
  // pattern?: string;
  settings?: EavAttributesTranslated;
  fullSettings?: EavAttributes;
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
