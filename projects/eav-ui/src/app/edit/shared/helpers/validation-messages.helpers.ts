import { AbstractControl, FormGroup } from '@angular/forms';
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
    pattern: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.Pattern` : `ValidationMessage.NotValid`;
    },
    decimals: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.Decimals` : `ValidationMessage.NotValid`;
    },
    jsonError: (config: FieldConfigSet) => {
      return config ? `ValidationMessage.JsonError` : `ValidationMessage.NotValid`;
    },
  };

  private static warningMessages: Record<string, string> = {
    jsonWarning: 'ValidationMessage.JsonWarning',
  };

  /** Marks controls as touched to show errors beneath controls and collects error messages */
  static validateForm(form: FormGroup): Record<string, string> {
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
      error = this.validationMessages[errorKey]?.(config);
      if (error) { break; }
    }

    return error;
  }

  static getWarningMessage(control: SxcAbstractControl): string {
    if (!control.dirty && !control.touched) { return; }
    if (control._warning$.value == null) { return; }

    for (const warningKey of Object.keys(control._warning$.value)) {
      const warning = this.warningMessages[warningKey];
      if (warning) { return warning; }
    }
  }
}