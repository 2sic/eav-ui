import { BehaviorSubject } from 'rxjs';
import { FieldConstants } from '../shared/models';
import { PickerData } from './picker/picker-data';
import { Adam } from '../../../../../edit-types/src/Adam';
import { Dropzone } from '../../../../../edit-types/src/Dropzone';

export interface FieldConfigSet extends FieldConstants {
  fieldName: string;
  focused$: BehaviorSubject<boolean>;
  adam?: Adam;
  dropzone?: Dropzone;

  /** 2dm experimental - try to share the picker data between the preview and dialog */
  pickerData?: PickerData;
}
