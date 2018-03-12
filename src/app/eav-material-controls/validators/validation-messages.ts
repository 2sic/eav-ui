import { FieldConfig } from '../../eav-dynamic-form/model/field-config';

export class ValidationMessages {

  // static onlySimpleUrlCharsValidatorMessage(err, field: FormlyFieldConfig) {
  //   return `"${field.formControl.value}" is not a valid URL`;
  // }

  static requiredMessage(config: FieldConfig) {
    return `You must enter a value`;
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

  static patternValidationMessage(err, field) {
    return `"${field.formControl.value}" is not a valid`;
  }
}
