import { ValidatorFn } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { EavAttributes, EavHeader } from '../../shared/models/eav';
import { FieldConfig, FieldSettings, Dropzone, Adam } from '../../../edit-types';

// spm split these interfaces into separate files
export interface FieldConfigSet {
  field: FieldConfigAngular;
  entity: ItemConfig;
  form: FormConfig;
  dropzone?: Dropzone;
  adam?: Adam;
  cache?: any;
}

export interface FieldConfigAngular extends FieldConfig {
  initialValue: any;
  validation: ValidatorFn[];
  fullSettings: EavAttributes;
  wrappers: string[];
  focused: boolean;
  isExternal: boolean;
  disableI18n: boolean;
  isLastInGroup: boolean;
  settings$: BehaviorSubject<FieldSettings>;
}

export interface FieldConfigGroup extends FieldConfigAngular {
  isParentGroup: boolean;
  fieldGroup: FieldConfigSet[];
}

export interface ItemConfig {
  entityId: number;
  entityGuid: string;
  contentTypeId: string;
  header: EavHeader;
}

export interface FormConfig {
  /** Unique id to be able to separate settings for each form instance, e.g. current language */
  formId: number;
}
