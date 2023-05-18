import { BehaviorSubject } from 'rxjs';
import { Adam, Dropzone } from '../../../../../../../edit-types';
import { FieldConstants } from '../../../shared/models';

export interface FieldConfigSet extends FieldConstants {
  name: string;
  focused$: BehaviorSubject<boolean>;
  adam?: Adam;
  dropzone?: Dropzone;
}

export interface FieldConfigSetExpandable extends FieldConfigSet {
  isPreview?: boolean;
}
