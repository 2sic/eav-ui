import { FormArray, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
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
}
