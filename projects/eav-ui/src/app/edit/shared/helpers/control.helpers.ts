import { AbstractControl } from '@angular/forms';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { FieldValueHelpers } from './FieldValueHelpers';

export class ControlHelpers {

  /** TODO: Try to remove this by assigning controls [formControlName] in [formGroup] */
  static markControlTouched(control: AbstractControl): void {
    if (control.touched)
      return;

    control.markAsTouched();
    control.updateValueAndValidity();
  }


  /** Use to update form controls value */
  static patchControlValue(control: AbstractControl, newValue: FieldValue): void {
    if (!control.touched)
      control.markAsTouched();

    if (!control.dirty && !FieldValueHelpers.fieldValuesAreEqual(control.value, newValue))
      control.markAsDirty();

    control.patchValue(newValue);
  }


  /** Disables/enables control if not already disabled/enabled. Use this helper to trigger fewer events on the form */
  static disableControl(control: AbstractControl, disable: boolean) {
    if (control.disabled === disable)
      return;

    if (disable)
      control.disable();
    else
      control.enable();
  }

}
