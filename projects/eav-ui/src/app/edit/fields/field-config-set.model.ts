import { BehaviorSubject } from 'rxjs';
import { Adam } from '../../../../../edit-types/src/Adam';
import { Dropzone } from '../../../../../edit-types/src/Dropzone';
import { FieldConstants } from '../state/fields-configs.model';

export interface FieldConfigSet extends FieldConstants {
  fieldName: string;
  focused$: BehaviorSubject<boolean>;
  // TODO: ATM it always adds this, but it would be better if we detect the input-type
  // and only add it then
  adam: Adam;
  dropzone?: Dropzone;
}
