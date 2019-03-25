import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable()
export class ValidationMessagesService {

  constructor() {
  }

  // static onlySimpleUrlCharsValidatorMessage(err, field: FormlyFieldConfig) {
  //   return `"${field.formControl.value}" is not a valid URL`;
  // }

  // static requiredMessage(config) {
  //   return `You must enter a value`;
  // }

  // static minlengthValidationMessage(err, field) {
  //   return `Should have atleast ${field.templateOptions.minLength} characters`;
  // }

  // static maxlengthValidationMessage(err, field) {
  //   return `This value should be less than ${field.settings.templateOptions.maxLength} characters`;
  // }

  // static minValidationMessage(err, field) {
  //   return `This value should be more than ${field.templateOptions.min}`;
  // }

  // static maxValidationMessage(err, field) {
  //   return `This value should be less than ${field.templateOptions.max}`;
  // }

  // static patternValidationMessage(err, field) {
  //   return `"${field.formControl.value}" is not a valid`;
  // }

  // return list of error messages
  public validationMessages(): any {
    const messages = {
      required: (config: FieldConfigSet) => {
        return config ? 'ValidationMessage.Required' : `ValidationMessage.RequiredShort`;
      },
      // minLength: (config: FieldConfig) => {
      //   return `Should have atleast ${config.currentFieldConfig.settings.MinLength} characters`;
      // },
      // maxLength: (config: FieldConfig) => {
      //   return `This value should be less than ${config.currentFieldConfig.settings.MaxLength} characters`;
      // },
      min: (config: FieldConfigSet) => {
        // return config ? `This value should be more than ${config.currentFieldConfig.settings.Min}` : `ValidationMessage.NotValid`;
        return config ? `ValidationMessage.Min` : `ValidationMessage.NotValid`;
      },
      max: (config: FieldConfigSet) => {
        return config ? `ValidationMessage.Max` : `ValidationMessage.NotValid`;
      },
      pattern: (config: FieldConfigSet) => {
        return config ? `ValidationMessage.Pattern` : `ValidationMessage.NotValid`;
      },
      decimals: (config: FieldConfigSet) => {
        return config ? `ValidationMessage.Decimals` : `ValidationMessage.NotValid`;
      },
    };

    return messages;
  }

  // Validate form instance
  // check_dirty true will only emit errors if the field is touched
  // check_dirty false will check all fields independent of
  // being touched or not. Use this as the last check before submitting
  public validateForm(formToValidate: FormGroup, checkDirty?: boolean): any {
    const form = formToValidate;
    const formErrors = {};
    Object.keys(form.controls).forEach(key => {
      // for (const control in form.controls) {
      const control = form.controls[key];
      if (control) {
        // const control = form.get(field);
        const messages = this.validationMessages();
        if (control && control.invalid) {
          if (!checkDirty || (control.dirty || control.touched)) {
            Object.keys(control.errors).forEach(keyError => {
              console.log('error key', keyError);
              formErrors[key] = formErrors[key] || messages[keyError](undefined);
            });
          }
          // this displays an error message on an invalid control
          control.markAsTouched({ onlySelf: true });
        }
      }
    });

    return formErrors;
  }

  /**
   * get validation error for control
   * @param control
   */
  public getErrorMessage(control: AbstractControl, config: FieldConfigSet, touched?: boolean): string {
    let formError = '';
    if (control) {
      const messages = this.validationMessages();
      if (control && control.invalid) {
        if ((control.dirty || control.touched) || touched) {
          Object.keys(control.errors).forEach(key => {
            if (messages[key]) {
              formError = messages[key](config);
            }
          });
        }
      }
    }
    return formError;
  }
}
