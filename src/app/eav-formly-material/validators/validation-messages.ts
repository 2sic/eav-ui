import { FormlyFieldConfig } from '@ngx-formly/core';

export class ValidationMessages {

  static onlySimpleUrlCharsValidatorMessage(err, field: FormlyFieldConfig) {
    return `"${field.formControl.value}" is not a valid URL`;
  }

  static minlengthValidationMessage(err, field) {
    return `Should have atleast ${field.templateOptions.minLength} characters`;
  }

  static maxlengthValidationMessage(err, field) {
    return `This value should be less than ${field.templateOptions.maxLength} characters`;
  }

  static minValidationMessage(err, field) {
    return `This value should be more than ${field.templateOptions.min}`;
  }

  static maxValidationMessage(err, field) {
    return `This value should be less than ${field.templateOptions.max}`;
  }

  static maxValidationPattern(err, field) {
    return `"${field.formControl.value}" is not a valid`;
  }
}
