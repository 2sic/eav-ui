import { Observable } from 'rxjs';
import { FieldSettings, FieldValue } from '../../../../../edit-types';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { Signal } from '@angular/core';
import { FieldConfigSet } from './field-config-set.model';
import { BasicControlSettings } from '../../../../../edit-types/src/BasicControlSettings';
import { ControlStatus } from '../shared/controls/control-status.model';
import { PickerData } from './picker/picker-data';

/**
 * This is provided / injected at the fields-builder for every single field.
 * So any control or service within that field, which requests this service, will get one containing exactly that fields.
 */
export class FieldState<T extends FieldValue> {
  constructor(
    /** The fields technical name to access settings etc. */
    public name: string,

    /** Field configuration, incl. a lot of unchanging values and access to adam, dropzone etc. */
    public config: FieldConfigSet,

    /** The form group containing the field - rarely relevant, as you should use the control in most cases */
    public group: UntypedFormGroup,

    /** The control of the field in the form group */
    public control: AbstractControl,

    // /** The settings as an observable - where possible, try to use the signal instead */
    // public settings$: Observable<FieldSettings>,

    /** The settings as a signal - use this for most cases */
    public settings: Signal<FieldSettings>,

    /** The basic settings - use this for most cases as it will change less than the settings signal */
    public basics: Signal<BasicControlSettings>,

    /**
     * Note: e just introduced uiValue below, which should be used in most cases
     */
    public controlStatus: Signal<ControlStatus<T>>,

    /** The value of the field in the UI control as a signal */
    public uiValue: Signal<T>,

    pickerData: PickerData,
  ) {
    this.#pickerData = pickerData;
  }

  get pickerData(): PickerData {
    if (this.#pickerData)
      return this.#pickerData;
    throw new Error('PickerData was not initialized for this field');
  }
  #pickerData: PickerData;
}
