import { AbstractControl } from '@angular/forms';
import { FieldValue } from '../../../../../../edit-types';

export interface ControlStatus<T extends FieldValue> {
  dirty: boolean;
  disabled: boolean;
  invalid: boolean;
  touched: boolean;

  /** Combined info if modified and not valid, typically to then show red headings */
  touchedAndInvalid: boolean;
  value: T;
}

export const emptyControlStatus: ControlStatus<FieldValue> = {
  value: null,
  disabled: true,
  dirty: false,
  invalid: false,
  touched: false,
  touchedAndInvalid: false
};

export function controlToControlStatus<T extends FieldValue>(control: AbstractControl, moreDisabled: boolean): ControlStatus<T> {
  const touched = control.touched;
  const invalid = control.invalid;
  // must merge the control status with settings, as the control often has a
  // delayed "disabled" update which will not itself trigger a change in the control
  const disabled = control.disabled || moreDisabled;
  return {
    dirty: control.dirty,
    disabled,
    invalid,
    touched,
    touchedAndInvalid: touched && invalid,
    value: control.value,
  };
}
