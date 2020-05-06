import { ValidatorFn, Validators } from '@angular/forms';

import { FieldSettings } from '../../../edit-types';
import { CustomValidators } from './custom-validators';
import { InputTypesConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';

export class ValidationHelper {

  public static getValidations(settings: FieldSettings): ValidatorFn[] {
    // important - a hidden field dont have validations and is not required
    const visibleInEditUI = (settings.VisibleInEditUI === false) ? false : true;
    return visibleInEditUI ? ValidationHelper.setDefaultValidations(settings) : [];
  }

  public static isRequired(settings: FieldSettings): boolean {
    const visibleInEditUI = (settings.VisibleInEditUI === false) ? false : true;
    return (settings.Required && visibleInEditUI) ? settings.Required : false;
  }

  private static setDefaultValidations(settings: FieldSettings): ValidatorFn[] {
    const validation: ValidatorFn[] = [];
    const required = settings.Required ? settings.Required : false;
    const isHyperlinkLibrary = settings.InputType === InputTypesConstants.hyperlinkLibrary;

    // hyperlink-library field will set custom required validator
    if (required && !isHyperlinkLibrary) {
      validation.push(Validators.required);
    }

    const pattern = settings.ValidationRegExJavaScript ? settings.ValidationRegExJavaScript : '';
    if (pattern) {
      validation.push(Validators.pattern(pattern));
    }

    if (settings.Decimals) {
      validation.push(CustomValidators.validateDecimals(settings.Decimals));
    }

    const max = settings.Max ? settings.Max : 0;
    if (max > 0) {
      validation.push(Validators.max(max));
    }

    const min = settings.Min ? settings.Min : 0;
    if (min > 0) {
      validation.push(Validators.min(min));
    }

    return validation;
  }
}
