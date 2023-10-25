import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { GeneralHelpers } from '.';
import { FieldConfigSet } from '../../form/builder/fields-builder/field-config-set.model';
import { SxcAbstractControl } from '../models';

export class ValidationMessagesHelpers {

  private static validationMessages: Record<string, (config: FieldConfigSet) => string> = {
    required: (config: FieldConfigSet) => {
      return config ? 'ValidationMessage.Required' : `ValidationMessage.RequiredShort`; // short version in snackbar
    },
    min: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.Min` : `ValidationMessage.NotValid`;
    },
    max: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.Max` : `ValidationMessage.NotValid`;
    },
    minNoItems: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.MinNoItems` : `ValidationMessage.NotValid`;
    },
    maxNoItems: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.MaxNoItems` : `ValidationMessage.NotValid`;
    },
    pattern: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.Pattern` : `ValidationMessage.NotValid`;
    },
    decimals: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.Decimals` : `ValidationMessage.NotValid`;
    },
    jsonError: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.JsonError` : `ValidationMessage.NotValid`;
    },
    formulaError: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.NotValid` : `ValidationMessage.NotValid`;
    },
  };

  private static warningMessages: Record<string, string> = {
    jsonWarning: 'ValidationMessage.JsonWarning',
    formulaWarning: 'ValidationMessage.NotValid',
  };

  /** Marks controls as touched to show errors beneath controls and collects error messages */
  static validateForm(form: UntypedFormGroup): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const [controlKey, control] of Object.entries(form.controls)) {
      GeneralHelpers.markControlTouched(control);

      if (!control.invalid) { continue; }

      for (const errorKey of Object.keys(control.errors)) {
        errors[controlKey] = this.validationMessages[errorKey]?.(undefined);
        if (errors[controlKey]) { break; }
      }
    }
    return errors;
  }

  /** Calculates error message */
  static getErrorMessage(control: AbstractControl, config: FieldConfigSet): string {
    let error = '';
    if (!control.invalid) { return error; }
    if (!control.dirty && !control.touched) { return error; }

    for (const errorKey of Object.keys(control.errors)) {
      if (errorKey === 'formulaError') {
        error = control.errors['formulaMessage'] ?? this.validationMessages[errorKey]?.(config);
      } else {
        error = this.validationMessages[errorKey]?.(config);
      }
      if (error) { break; }
    }

    return error;
  }

  static getWarningMessage(control: SxcAbstractControl): string {
    let warning = '';
    if (control._warning$.value == null) { return warning; }
    if (!control.dirty && !control.touched) { return warning; }

    for (const warningKey of Object.keys(control._warning$.value)) {
      if (warningKey === 'formulaWarning') {
        warning = control._warning$.value['formulaMessage'] ?? this.warningMessages[warningKey];
      } else {
        warning = this.warningMessages[warningKey];
      }
      if (warning) { break; }
    }
    return warning;
  }
}
