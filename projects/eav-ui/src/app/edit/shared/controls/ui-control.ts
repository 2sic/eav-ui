import { AbstractControl } from '@angular/forms';
import { FieldValue } from '../../../../../../edit-types';
import { classLog } from '../../../shared/logging';
import { FieldValueHelpers } from '../helpers/field-value.helpers';

const logSpecs = {
  all: true,
  constructor: true,
  markTouched: true,
  set: true,
  disable: true,
  fields: ['*'] as string[], // example: ['SomeField'],
};

export class UiControl<T extends FieldValue = FieldValue> {

  log = classLog({ UiControl }, logSpecs);

  constructor(
    public control: AbstractControl,
    private moreDisabled: boolean = false,
  ) {
    // Patch control with dummy object for the nullable case where we're just creating a fake control...
    this.control ??= { dirty: false, invalid: false, touched: false, value: null, disabled: false } as AbstractControl;
    this.log.fnIf('constructor', { moreDisabled });
  }

  static emptyControl() {
    return new UiControl({ dirty: false, invalid: false, touched: false, value: null, disabled: false } as AbstractControl);
  }

  //#region simple direct properties
  get dirty() { return this.control.dirty; }
  get invalid() { return this.control.invalid; }
  get touched() { return this.control.touched; }
  get value() { return this.control.value as T; } // todo: maybe remove?
  //#endregion

  //#region complex properties
  get disabled() { return this.control.disabled || this.moreDisabled; }
  get touchedAndInvalid() { return this.control.touched && this.control.invalid; }
  //#endregion

  //#region methods
  
  markTouched(): void {
    this.log.fnIf('markTouched');
    UiControl.markTouched(this.control);
  }

  setIfChanged(newValue: FieldValue): void {
    this.log.fnIf('set', { newValue });
    if (newValue === this.value) return;
    this.set(newValue);
  }

  /** Use to update form controls value */
  set(newValue: FieldValue): void {
    this.log.fnIf('set', { newValue });
    const control = this.control;
    if (!control.touched)
      control.markAsTouched();

    if (!control.dirty && !FieldValueHelpers.fieldValuesAreEqual(control.value, newValue))
      control.markAsDirty();

    control.patchValue(newValue);
  }

  disable(disable: boolean): void {
    this.log.fnIf('disable', { disable });
    UiControl.disable(this.control, disable);
  }

  //#endregion

  //#region private helpers

  /** TODO: Try to remove this by assigning controls [formControlName] in [formGroup] */
  static markTouched(control: AbstractControl): void {
    if (control.touched)
      return;

    control.markAsTouched();
    control.updateValueAndValidity();
  }

  /** Disables/enables control if not already disabled/enabled. Use this helper to trigger fewer events on the form */
  static disable(control: AbstractControl, disable: boolean) {
    if (control.disabled === disable)
      return;

    if (disable)
      control.disable();
    else
      control.enable();
  }
  //#endregion
}