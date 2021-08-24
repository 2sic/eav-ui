import { AbstractControl } from '@angular/forms';
import { FieldValue } from '../../../edit-types';
import { FormValues } from '../models';

export class GeneralHelpers {

  static objectsEqual<T>(x: T, y: T): boolean {
    if (x == null || y == null) { return x === y; }

    const obj1 = x as Record<string, any>;
    const obj2 = y as Record<string, any>;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) { return false; }

    const equal = keys1.every(key1 => {
      if (!obj2.hasOwnProperty(key1)) { return false; }

      return obj1[key1] === obj2[key1];
    });

    return equal;
  }

  static arraysEqual<T>(x: T[], y: T[]): boolean {
    if (x == null || y == null) { return x === y; }

    if (x.length !== y.length) { return false; }

    const equal = x.every((item, index) => {
      return x[index] === y[index];
    });

    return equal;
  }

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

  static toggleInArray<T>(item: T, array: T[]): void {
    const index = array.indexOf(item);
    if (index === -1) {
      array.push(item);
    } else {
      array.splice(index, 1);
    }
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

  private static controlValuesEqual(x: FieldValue, y: FieldValue): boolean {
    if (x === y) { return true; }
    if (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y)) { return true; }
    if (Array.isArray(x) && Array.isArray(y) && this.arraysEqual(x, y)) { return true; }
    return false;
  }

  /** Disables/enables control if not already disabled/enabled. Use this helper to trigger fewer events on the form */
  static disableControl(control: AbstractControl, disable: boolean) {
    if (control.disabled === disable) { return; }

    if (disable) {
      control.disable();
    } else {
      control.enable();
    }
  }
}
