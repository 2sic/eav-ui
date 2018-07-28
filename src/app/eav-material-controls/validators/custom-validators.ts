import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Helper } from '../../shared/helpers/helper';

export class CustomValidators {

  /**
   * validate url chars
   *
   */
  static onlySimpleUrlChars(allowPath: boolean, trimEnd: boolean): ValidationErrors {
    return (control: FormControl): { [key: string]: any } => {
      const cleanInputValue = Helper.stripNonUrlCharacters(control.value, allowPath, trimEnd);
      return (cleanInputValue === control.value) ? null : { 'onlySimpleUrlChars': true };
    };
  }

  // create a static method for your validation
  static validateDecimals(decimals: number): ValidatorFn {
    return (control: FormControl): { [key: string]: any } => {
      // first check if the control has a value
      if (control.value) {
        // match the control value against the regular expression
        const matches = control.value.toString().match(`^[0-9]+(\.[0-9]{1,${decimals}})?$`);
        // if there are not matches return an object, else return null.
        return !matches ? { decimals: true } : null;
      } else {
        return null;
      }
    };
  }

}
