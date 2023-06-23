import { BehaviorSubject } from 'rxjs';
import { Adam, Dropzone } from '../../../../../../../edit-types';
import { FieldConstants } from '../../../shared/models';

export interface FieldConfigSet extends FieldConstants {
  name: string;
  focused$: BehaviorSubject<boolean>;
  adam?: Adam;
  dropzone?: Dropzone;
}

/** this interface is used when we have multiple controls for a single field 
  (e.g. field and a preview) so it is possible to pass different values to each control */
export interface FieldControlConfig {
  isPreview?: boolean;
}
