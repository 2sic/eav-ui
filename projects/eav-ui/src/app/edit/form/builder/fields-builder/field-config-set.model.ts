import { BehaviorSubject } from 'rxjs';
import { Adam, Dropzone } from '../../../../../../../edit-types';
import { FieldConstants } from '../../../shared/models';
import { PickerData } from '../../fields/picker/picker-data';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { InjectionToken } from '@angular/core';

/**
 * Experimental 2dm
 */
export class FieldState {
  constructor(
    public name: string,
    public config: FieldConfigSet,
    public controlConfig: FieldControlConfig,
    public group: UntypedFormGroup,
    public control: AbstractControl,
  ) { }
}

// export const TEST_TOKEN = new InjectionToken<string>('TEST_TOKEN');

export interface FieldConfigSet extends FieldConstants {
  name: string;
  focused$: BehaviorSubject<boolean>;
  adam?: Adam;
  dropzone?: Dropzone;

  /** 2dm experimental - try to share the picker data between the preview and dialog */
  pickerData?: PickerData;
}

/** this interface is used when we have multiple controls for a single field 
  (e.g. field and a preview) so it is possible to pass different values to each control */
export interface FieldControlConfig {
  isPreview?: boolean;
}
