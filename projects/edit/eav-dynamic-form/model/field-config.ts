import { BehaviorSubject } from 'rxjs';
import { Adam, Dropzone } from '../../../edit-types';
import { FieldHelper } from '../../eav-item-dialog/item-edit-form/field-helper';
import { EntityInfo, FieldConstants } from '../../shared/models';

export interface FieldConfigSet extends FieldConstants {
  name: string;
  adam?: Adam;
  dropzone?: Dropzone;
  entityCache$?: BehaviorSubject<EntityInfo[]>;
  /** If field has this property, it is an empty-default field */
  _fieldGroup?: FieldConfigSet[];
  fieldHelper?: FieldHelper;
  focused$?: BehaviorSubject<boolean>;
}
