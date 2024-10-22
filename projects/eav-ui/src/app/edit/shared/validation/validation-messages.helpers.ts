import { UntypedFormGroup } from '@angular/forms';
import { UiControl } from '../controls/ui-control';

// prefix for translation keys
const prefix = 'ValidationMessage.';
const notValid = 'ValidationMessage.NotValid';

export class ValidationMsgHelper {

  public static messages: Record<string, (long: boolean) => string> = {
    required: (long: boolean) => long ? `${prefix}Required` : `${prefix}RequiredShort` /* short version in snackbar*/,
    min: (long: boolean) => long ? `${prefix}Min` : notValid,
    max: (long: boolean) => long ? `${prefix}Max` : notValid,
    minNoItems: (long: boolean) => long ? `${prefix}MinNoItems` : notValid,
    maxNoItems: (long: boolean) => long ? `${prefix}MaxNoItems` : notValid,
    pattern: (long: boolean) => long ? `${prefix}Pattern` : notValid,
    decimals: (long: boolean) => long ? `${prefix}Decimals` : notValid,
    jsonError: (long: boolean) => long ? `${prefix}JsonError` : notValid,
    formulaError: (long: boolean) => notValid,
  };

  /** Marks controls as touched to show errors beneath controls and collects error messages */
  static validateForm(form: UntypedFormGroup): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const [controlKey, control] of Object.entries(form.controls)) {
      UiControl.markTouched(control);

      if (!control.invalid) continue;

      for (const errorKey of Object.keys(control.errors)) {
        errors[controlKey] = this.messages[errorKey]?.(false);
        if (errors[controlKey]) break;
      }
    }
    return errors;
  }

}
