import { UntypedFormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../fields/field-config-set.model';
import { AbstractControlPro } from './validation.helpers';
import { UiControl } from '../controls/ui-control';

// prefix for translation keys
const pfx = 'ValidationMessage.';

export class ValidationMessagesHelpers {

  private static validationMessages: Record<string, (config: FieldConfigSet) => string> = {
    required: (config: FieldConfigSet) => config ? `${pfx}Required` : `${pfx}RequiredShort` /* short version in snackbar*/,
    min: (config: FieldConfigSet) => config ? `${pfx}Min` : `${pfx}NotValid`,
    max: (config: FieldConfigSet) => config ? `${pfx}Max` : `${pfx}NotValid`,
    minNoItems: (config: FieldConfigSet) => config ? `${pfx}MinNoItems` : `${pfx}NotValid`,
    maxNoItems: (config: FieldConfigSet) => config ? `${pfx}MaxNoItems` : `${pfx}NotValid`,
    pattern: (config: FieldConfigSet) => config ? `${pfx}Pattern` : `${pfx}NotValid`,
    decimals: (config: FieldConfigSet) => config ? `${pfx}Decimals` : `${pfx}NotValid`,
    jsonError: (config: FieldConfigSet) => config ? `${pfx}JsonError` : `${pfx}NotValid`,
    formulaError: (config: FieldConfigSet) => config ? `${pfx}NotValid` : `${pfx}NotValid`,
  };

  private static warningMessages: Record<string, string> = {
    jsonWarning: `${pfx}JsonWarning`,
    formulaWarning: `${pfx}NotValid`,
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
    if (control._warning$.value == null) { return ''; }
    if (!control.dirty && !control.touched) { return ''; }
    
    let warning = '';
    for (const warningKey of Object.keys(control._warning$.value)) {
      warning = (warningKey === 'formulaWarning')
        ? control._warning$.value['formulaMessage'] ?? this.warningMessages[warningKey]
        : this.warningMessages[warningKey];
      if (warning) break;
    }
    return warning;
  }
}
