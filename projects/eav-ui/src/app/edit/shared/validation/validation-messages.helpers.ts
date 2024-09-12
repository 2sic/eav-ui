import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../fields/field-config-set.model';
import { AbstractControlPro } from './validation.helpers';
import { UiControl } from '../controls/control-status.model';

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
      UiControl.markTouched(control);

      if (!control.invalid) continue;

      for (const errorKey of Object.keys(control.errors)) {
        errors[controlKey] = this.validationMessages[errorKey]?.(undefined);
        if (errors[controlKey]) break;
      }
    }
    return errors;
  }

  /** Calculates error message */
  static getErrorMessage(uiControl: UiControl, config: FieldConfigSet): string {
    const control = uiControl.control;
    if (!control.invalid) return '';
    if (!control.dirty && !control.touched) return '';

    for (const errorKey of Object.keys(control.errors)) {
      const error = (errorKey === 'formulaError')
        ? control.errors['formulaMessage'] ?? this.validationMessages[errorKey]?.(config)
        : this.validationMessages[errorKey]?.(config);
      if (error) return error;
    }

    return '';
  }

  static getWarningMessage(uiControl: UiControl): string {
    const control = uiControl.control as AbstractControlPro;
    let warning = '';
    if (control._warning$.value == null) { return warning; }
    if (!control.dirty && !control.touched) { return warning; }

    for (const warningKey of Object.keys(control._warning$.value)) {
      if (warningKey === 'formulaWarning') {
        warning = control._warning$.value['formulaMessage'] ?? this.warningMessages[warningKey];
      } else {
        warning = this.warningMessages[warningKey];
      }
      if (warning) break;
    }
    return warning;
  }
}
