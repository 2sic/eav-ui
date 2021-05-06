import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Dictionary } from '../../../ng-dialogs/src/app/shared/models/dictionary.model';
import { UrlHelpers } from '../../shared/helpers';
import { AdamControl } from '../input-types/hyperlink/hyperlink-library/hyperlink-library.models';

export class CustomValidators {

  /** Validate url chars */
  static onlySimpleUrlChars(allowPath: boolean, trimEnd: boolean): ValidationErrors {
    return (control: FormControl): Dictionary<boolean> => {
      const cleanInputValue = UrlHelpers.stripNonUrlCharacters(control.value, allowPath, trimEnd);
      return (cleanInputValue === control.value) ? null : { onlySimpleUrlChars: true };
    };
  }

  // create a static method for your validation
  static validateDecimals(decimals: number): ValidatorFn {
    return (control: FormControl): Dictionary<boolean> => {
      if (!control.value) {
        return null;
      }

      const matches = control.value.toString().match(`^-?[0-9]+(\.[0-9]{1,${decimals}})?$`);
      return !matches ? { decimals: true } : null;
    };
  }

  static validateAdam(): ValidatorFn {
    return (control: FormControl & AdamControl): Dictionary<boolean> => {
      if (control.adamItems == null || control.adamItems === 0) {
        return { required: true };
      }

      return null;
    };
  }
}
