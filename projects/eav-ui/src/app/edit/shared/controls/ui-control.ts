import { AbstractControl } from '@angular/forms';
import isEqual from 'lodash-es/isEqual';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { classLog } from '../../../shared/logging';
import { DebugFields } from '../../edit-debug';
import { FieldValueHelpers } from '../helpers/field-value.helpers';
import { ValidationMsgHelper } from '../validation/validation-messages.helpers';
import { AbstractControlPro } from '../validation/validation.helpers';

const logSpecs = {
  all: true,
  constructor: false,
  markTouched: false,
  set: false,
  disable: false,
  getErrors: true,
  fields: [...DebugFields, '*'],
};

const pfx = 'ValidationMessage.';

/**
 * Provides information about the UI Control, but NOT the value.
 * It is used to simplify the logic when interacting with the Angular Virtual Form.
 */
export class UiControl {

  log = classLog({UiControl}, logSpecs);

  constructor(
    public control: AbstractControl,
    private name = 'unknown',
    private moreDisabled: boolean = false,
  ) {
    // Patch control with dummy object for the nullable case where we're just creating a fake control...
    this.control ??= { dirty: false, invalid: false, touched: false, value: null, disabled: false } as AbstractControl;
    this.log.extendName(`[${name}]`);
    this.log.aIfInList('fields', this.name, { moreDisabled }, 'constructor');
  }

  static emptyControl() {
    return new UiControl({ dirty: false, invalid: false, touched: false, value: null, disabled: false } as AbstractControl);
  }

  //#region simple direct properties & complex properties
  get dirty() { return this.control.dirty; }
  get invalid() { return this.control.invalid; }
  get touched() { return this.control.touched; }
  get disabled() { return this.control.disabled || this.moreDisabled; }
  get touchedAndInvalid() { return this.control.touched && this.control.invalid; }
  //#endregion

  //#region methods

  markTouched(): void {
    this.log.aIfInList('fields', this.name, null, 'markTouched');
    UiControl.markTouched(this.control);
  }

  setIfChanged(newValue: FieldValue): void {
    const before = this.control.value;
    this.log.aIfInList('fields', this.name, { before, newValue }, 'setIfChanged');
    if (isEqual(newValue, this.control.value)) return;
    this.#set(newValue);
  }

  /** Use to update form controls value */
  #set(newValue: FieldValue): void {
    const control = this.control;
    const before = control.value;
    this.log.aIfInList('fields', this.name, { before, newValue }, 'set');

    if (!control.touched)
      control.markAsTouched();

    if (!control.dirty && !FieldValueHelpers.fieldValuesAreEqual(before, newValue))
      control.markAsDirty();

    // Note: 2024-10-21 ca. 18.02 we have some timing issues, error always seems to show previous error; maybe fixed now, otherwise revisit
    // Set value must happen at the end, otherwise errors will be late by one cycle
    // for example, they could show "required" after the value was
    control.patchValue(newValue);
  }

  disable(disable: boolean): void {
    this.log.aIfInList('fields', this.name, null, `disable: ${disable}`);
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

  /** Calculates error message */
  getErrors(): string {
    const control = this.control;
    const errors = control.errors;
    const l = this.log.fnIfInFields('getErrors', this.name, { control, name: this.name });
    if (!control.invalid)
      return l.r('', 'valid');
    if (!control.dirty && !control.touched)
      return l.r('', 'not dirty or touched');

    for (const errorKey of Object.keys(errors)) {
      const error = (errorKey === 'formulaError')
        ? control.errors['formulaMessage'] ?? ValidationMsgHelper.messages[errorKey]?.(true)
        : ValidationMsgHelper.messages[errorKey]?.(true);
      if (error)
        return l.r(error, 'error found');
    }

    return l.r('', 'no error');
  }

  #warningMessages: Record<string, string> = {
    jsonWarning: `${pfx}JsonWarning`,
    formulaWarning: `${pfx}NotValid`,
  };

  getWarnings(): string {
    const control = this.control as AbstractControlPro;
    if (control._warning == null)
      return '';
    if (!control.dirty && !control.touched)
      return '';

    let warning = '';
    for (const warningKey of Object.keys(control._warning)) {
      warning = (warningKey === 'formulaWarning')
        ? control._warning['formulaMessage'] ?? this.#warningMessages[warningKey]
        : this.#warningMessages[warningKey];
      if (warning)
        break;
    }
    return warning;
  }
}
