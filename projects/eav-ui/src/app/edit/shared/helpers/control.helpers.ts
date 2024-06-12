import { FieldValue } from 'projects/edit-types';
import { RxHelpers } from '../../../shared/rxJs/rx.helpers';
import { AbstractControl } from '@angular/forms';
import { FormValues } from '../models/form-values.model';

export class ControlHelpers {


  /** Searches where newValues has values different from oldValues */
  static getFormChanges(oldValues: FormValues, newValues: FormValues): FormValues {
    const changes: FormValues = {};
    for (const key of Object.keys(newValues)) {
      const newValue = newValues[key];
      const oldValue = oldValues[key];
      if (this.controlValuesEqual(newValue, oldValue)) { continue; }

      changes[key] = newValue;
    }
    return Object.keys(changes).length === 0 ? undefined : changes;
  }

  /** TODO: Try to remove this by assigning controls [formControlName] in [formGroup] */
  static markControlTouched(control: AbstractControl): void {
    if (control.touched) { return; }

    control.markAsTouched();
    control.updateValueAndValidity();
  }


  /** Use to update form controls value */
  static patchControlValue(control: AbstractControl, newValue: FieldValue): void {
    if (!control.touched) {
      control.markAsTouched();
    }
    if (!control.dirty && !this.controlValuesEqual(control.value, newValue)) {
      control.markAsDirty();
    }
    control.patchValue(newValue);
  }


  /** Disables/enables control if not already disabled/enabled. Use this helper to trigger fewer events on the form */
  static disableControl(control: AbstractControl, disable: boolean) {
    if (control.disabled === disable) return;

    if (disable)
      control.disable();
    else
      control.enable();
  }

  private static controlValuesEqual(x: FieldValue, y: FieldValue): boolean {
    if (x === y) { return true; }
    if (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y)) { return true; }
    if (Array.isArray(x) && Array.isArray(y) && RxHelpers.arraysEqual(x, y)) { return true; }
    return false;
  }
}