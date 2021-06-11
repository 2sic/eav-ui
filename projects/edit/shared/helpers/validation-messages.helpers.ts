import { AbstractControl, FormGroup } from '@angular/forms';
import { GeneralHelpers } from '.';
import { FieldConfigSet } from '../../form/model/field-config';

export class ValidationMessagesHelpers {

  private static validationMessages: Record<string, (config: FieldConfigSet) => string> = {
    required: (config: FieldConfigSet) => {
      return config ? 'ValidationMessage.Required' : `ValidationMessage.RequiredShort`; // short version in toaster
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
}
