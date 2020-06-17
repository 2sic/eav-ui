import { ValidatorFn } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

import { EavAttributes, EavHeader } from '../../shared/models/eav';
import { FieldConfig, FieldSettings } from '../../../edit-types';
import { Adam } from '../../../edit-types';

// spm split these interfaces into separate files
export interface FieldConfigSet {
  field: FieldConfigAngular;
  entity: ItemConfig;
  form: FormConfig;
  adam?: Adam;
  dropzoneConfig$?: BehaviorSubject<DropzoneConfigInterface>;
  dropzoneDisabled$?: BehaviorSubject<boolean>;
  cache?: any;
  saveImage?: (image: File) => void;
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
