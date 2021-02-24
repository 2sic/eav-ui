import { BehaviorSubject } from 'rxjs';
import { Adam, Dropzone } from '../../../edit-types';
import { EntityInfo, FieldConstants } from '../../shared/models';

export interface FieldConfigSet extends FieldConstants {
  name: string;
  adam?: Adam;
  dropzone?: Dropzone;
  entityCache$?: BehaviorSubject<EntityInfo[]>;
  /** If field has this property, it is an empty-default field */
  _fieldGroup?: FieldConfigSet[];
  focused$?: BehaviorSubject<boolean>;
}
