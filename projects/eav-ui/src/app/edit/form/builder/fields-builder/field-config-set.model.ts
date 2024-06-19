import { BehaviorSubject, Observable } from 'rxjs';
import { Adam, Dropzone, FieldSettings } from '../../../../../../../edit-types';
import { FieldConstants } from '../../../shared/models';
import { PickerData } from '../../fields/picker/picker-data';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { Signal } from '@angular/core';
import { BasicControlSettings } from 'projects/edit-types/src/BasicControlSettings';

/**
 * Experimental 2dm.
 * 
 * This is provided / injected at the fields-builder for every single field.
 */
export class FieldState {
  constructor(
    public name: string,
    public config: FieldConfigSet,
    public controlConfig: FieldControlConfig,
    public group: UntypedFormGroup,
    public control: AbstractControl,
    public settings$: Observable<FieldSettings>,
    public settings: Signal<FieldSettings>,
    public basics: Signal<BasicControlSettings>,
  ) { }
}

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
