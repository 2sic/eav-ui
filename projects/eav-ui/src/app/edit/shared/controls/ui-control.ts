import { AbstractControl } from '@angular/forms';
import isEqual from 'lodash-es/isEqual';
import { FieldValue } from '../../../../../../edit-types';
import { classLog } from '../../../shared/logging';
import { DebugFields } from '../../edit-debug';
import { FieldConfigSet } from '../../fields/field-config-set.model';
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
  fields: [...DebugFields, 'minValue'],
};

const pfx = 'ValidationMessage.';

/**
 * Provides information about the UI Control, but NOT the value.
 * It is used to simplify the logic when interacting with the Angular Virtual Form.
 */
export class UiControl {

  log = classLog({UiControl}, logSpecs, true);

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

  //#region simple direct properties
  get dirty() { return this.control.dirty; }
  get invalid() { return this.control.invalid; }
  get touched() { return this.control.touched; }
  //#endregion

  //#region complex properties
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
    this.set(newValue);
  }

  /** Use to update form controls value */
  set(newValue: FieldValue): void {
    const control = this.control;
    const before = control.value;
    this.log.aIfInList('fields', this.name, { before, newValue }, 'set');

    if (!control.touched)
      control.markAsTouched();

    if (!control.dirty && !FieldValueHelpers.fieldValuesAreEqual(before, newValue))
      control.markAsDirty();

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
  getErrors(config: FieldConfigSet): string {
    const control = this.control;
    const l = this.log.fnIfInList('getErrors', 'fields', config.fieldName, { control, config });
    if (!control.invalid) return l.r('', 'valid');
    if (!control.dirty && !control.touched) return l.r('', 'not dirty or touched');

    for (const errorKey of Object.keys(control.errors)) {
      const error = (errorKey === 'formulaError')
        ? control.errors['formulaMessage'] ?? ValidationMsgHelper.validationMessages[errorKey]?.(config)
        : ValidationMsgHelper.validationMessages[errorKey]?.(config);
      if (error) return l.r(error, 'error found');
    }

    return l.r('', 'no error');
  }

  #warningMessages: Record<string, string> = {
    jsonWarning: `${pfx}JsonWarning`,
    formulaWarning: `${pfx}NotValid`,
  };

  getWarnings(): string {
    const control = this.control as AbstractControlPro;
    if (control._warning$.value == null) { return ''; }
    if (!control.dirty && !control.touched) { return ''; }

    let warning = '';
    for (const warningKey of Object.keys(control._warning$.value)) {
      warning = (warningKey === 'formulaWarning')
        ? control._warning$.value['formulaMessage'] ?? this.#warningMessages[warningKey]
        : this.#warningMessages[warningKey];
      if (warning) break;
    }
    return warning;
  }
}
