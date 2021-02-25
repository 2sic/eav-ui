import { ValidatorFn, Validators } from '@angular/forms';
import { FieldSettings } from '../../../edit-types';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { EavContentTypeAttribute } from '../../shared/models/eav';
import { CustomValidators } from './custom-validators';

export class ValidationHelper {

  static isRequired(settings: FieldSettings): boolean {
    // hidden field can't be required
    const visible = settings.VisibleInEditUI ?? true;
    if (!visible) { return false; }

    const required = settings.Required ?? false;
    return required;
  }

  static getValidators(settings: FieldSettings, attribute: EavContentTypeAttribute): ValidatorFn[] {
    // hidden field can't have validators
    const visible = settings.VisibleInEditUI ?? true;
    if (!visible) { return []; }

    const validators: ValidatorFn[] = [];

    // hyperlink-library field will set custom required validator
    const required = settings.Required ?? false;
    const isHyperlinkLibrary = attribute.InputType === InputTypeConstants.HyperlinkLibrary;
    if (required && !isHyperlinkLibrary) {
      validators.push(Validators.required);
    }

    if (settings.ValidationRegExJavaScript) {
      validators.push(Validators.pattern(settings.ValidationRegExJavaScript));
    }

    if (settings.Decimals) {
      validators.push(CustomValidators.validateDecimals(settings.Decimals));
    }

    if (settings.Max > 0) {
      validators.push(Validators.max(settings.Max));
    }

    if (settings.Min > 0) {
      validators.push(Validators.min(settings.Min));
    }

    return validators;
  }
}
