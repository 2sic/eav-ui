import { ValidatorFn } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Adam, Dropzone, FieldConfig, FieldSettings } from '../../../edit-types';
import { FieldHelper } from '../../eav-item-dialog/item-edit-form/field-helper';
import { EavAttributes, EavHeader } from '../../shared/models/eav';
import { EntityInfo } from '../../shared/models/eav/entity-info';

// spm split these interfaces into separate files
export interface FieldConfigSet {
  field: FieldConfigAngular;
  entity: ItemConfig;
  form: FormConfig;
  dropzone?: Dropzone;
  adam?: Adam;
  entityCache$?: BehaviorSubject<EntityInfo[]>;
}

export interface FieldConfigAngular extends FieldConfig {
  initialValue: any;
  validation: ValidatorFn[];
  fullSettings: EavAttributes;
  wrappers: string[];
  focused$: BehaviorSubject<boolean>;
  isExternal: boolean;
  disableI18n: boolean;
  isLastInGroup: boolean;
  settings$: BehaviorSubject<FieldSettings>;
  fieldHelper: FieldHelper;
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
  enableHistory: boolean;
}
