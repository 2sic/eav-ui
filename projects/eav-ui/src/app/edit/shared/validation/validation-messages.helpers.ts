import { UntypedFormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../fields/field-config-set.model';
import { UiControl } from '../controls/ui-control';

// prefix for translation keys
const pfx = 'ValidationMessage.';

export class ValidationMsgHelper {

  static validationMessages: Record<string, (config: FieldConfigSet) => string> = {
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

}
