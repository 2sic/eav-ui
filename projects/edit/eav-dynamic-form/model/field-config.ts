import { ValidatorFn } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Adam, Dropzone, FieldConfig } from '../../../edit-types';
import { FieldHelper } from '../../eav-item-dialog/item-edit-form/field-helper';
import { EntityInfo } from '../../shared/models';
import { EavEntityAttributes } from '../../shared/models/eav';

export interface FieldConfigSet {
  field: FieldConfigAngular;
  entity: ItemConfig;
  dropzone?: Dropzone;
  adam?: Adam;
  entityCache$?: BehaviorSubject<EntityInfo[]>;
}

export interface FieldConfigAngular extends FieldConfig {
  initialValue: any;
  validation: ValidatorFn[];
  fullSettings: EavEntityAttributes;
  wrappers: string[];
  focused$: BehaviorSubject<boolean>;
  isExternal: boolean;
  disableI18n: boolean;
  isLastInGroup: boolean;
  fieldHelper: FieldHelper;
  /** If field has this property, it is an empty-default field */
  _fieldGroup: FieldConfigSet[];
}

export interface ItemConfig {
  entityId: number;
  entityGuid: string;
  contentTypeId: string;
}
