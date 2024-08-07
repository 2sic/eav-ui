import { BehaviorSubject } from 'rxjs';
import { Adam, Dropzone } from '../../../../../../../edit-types';
import { FieldConstants } from '../../../shared/models';
import { PickerData } from '../../fields/picker/picker-data';

export interface FieldConfigSet extends FieldConstants {
  name: string;
  focused$: BehaviorSubject<boolean>;
  adam?: Adam;
  dropzone?: Dropzone;

  /** 2dm experimental - try to share the picker data between the preview and dialog */
  pickerData?: PickerData;
}
