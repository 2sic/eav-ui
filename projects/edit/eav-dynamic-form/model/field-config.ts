import { ValidatorFn } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Adam, Dropzone, FieldConfig } from '../../../edit-types';
import { FieldHelper } from '../../eav-item-dialog/item-edit-form/field-helper';
import { EntityInfo } from '../../shared/models';
import { EavEntityAttributes, EavHeader } from '../../shared/models/eav';

// spm split these interfaces into separate files
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
