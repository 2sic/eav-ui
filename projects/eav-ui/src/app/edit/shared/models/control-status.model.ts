import { AbstractControl } from '@angular/forms';
import { FieldValue } from '../../../../../../edit-types';

export interface ControlStatus<T = FieldValue> {
  dirty: boolean;
  disabled: boolean;
  invalid: boolean;
  touched: boolean;

  /** Combined info if modified and not valid, typically to then show red headings */
  touchedAndInvalid: boolean;
  value: T;
}


export function controlToControlStatus<T>(control: AbstractControl): ControlStatus<T> {
  const touched = control.touched;
  const invalid = control.invalid;
  return {
    dirty: control.dirty,
    disabled: control.disabled,
    invalid,
    touched,
    touchedAndInvalid: touched && invalid,
    value: control.value,
  };
}
