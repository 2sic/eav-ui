import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, ValidationErrors } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import {
  MatFormFieldModule,
  MatButtonModule,
  MatCheckboxModule,
  MatInputModule,
  MatSelectModule
} from '@angular/material';
import { FormlyWrapperFormField, FormlyFieldInput, FormlyMaterialModule } from '@ngx-formly/material';

import {
  PanelWrapperComponent,
  LabelWrapperComponent,
  CollapsibleWrapperComponent,
  HorizontalInputWrapperComponent,
  FormFieldWrapperComponent
} from './wrappers';
import { StringDefaultComponent } from './input-types';
import { InputTypesConstants } from '../shared/constants';
import { StringUrlPathComponent } from './input-types/string/string-url-path/string-url-path.component';
import { StringDropdownComponent } from './input-types/string/string-dropdown/string-dropdown.component';
import { StringDropdownQueryComponent } from './input-types/string/string-dropdown-query/string-dropdown-query.component';
import { StringFontIconPickerComponent } from './input-types/string/string-font-icon-picker/string-font-icon-picker.component';
import { CustomValidators } from './validators/custom-validators';


// export function IpValidator(control: FormControl): ValidationErrors {
//   return /(\d{1,3}\.){3}\d{1,3}/.test(control.value) ? null : { 'ip': true };
// }

export function onlySimpleUrlCharsValidatorMessage(err, field: FormlyFieldConfig) {
  return `"${field.formControl.value}" is not a valid URL`;
}

export function minlengthValidationMessage(err, field) {
  return `Should have atleast ${field.templateOptions.minLength} characters`;
}

export function maxlengthValidationMessage(err, field) {
  return `This value should be less than ${field.templateOptions.maxLength} characters`;
}

export function minValidationMessage(err, field) {
  return `This value should be more than ${field.templateOptions.min}`;
}

export function maxValidationMessage(err, field) {
  return `This value should be less than ${field.templateOptions.max}`;
}

@NgModule({
  declarations: [
    // wrappers
    PanelWrapperComponent,
    LabelWrapperComponent,
    CollapsibleWrapperComponent,
    HorizontalInputWrapperComponent,
    FormFieldWrapperComponent,
    // types
    StringDefaultComponent,
    FormFieldWrapperComponent,
    StringUrlPathComponent,
    StringDropdownComponent,
    StringDropdownQueryComponent,
    StringFontIconPickerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    FormlyModule.forRoot({
      wrappers: [
        { name: 'panel', component: PanelWrapperComponent },
        { name: 'label', component: LabelWrapperComponent },
        { name: 'collapsible', component: CollapsibleWrapperComponent },
        { name: 'horizontal-wrapper', component: HorizontalInputWrapperComponent },
        { name: 'form-field', component: FormlyWrapperFormField },
        { name: 'form-field-wrapper', component: FormFieldWrapperComponent } // copy of FormlyWrapperFormField
      ],
      types: [
        {
          name: 'horizontalInput',
          extends: 'input',
          wrappers: ['form-field', 'horizontal-wrapper']
        },
        {
          name: InputTypesConstants.stringDefault,
          component: StringDefaultComponent,
          wrappers: ['form-field'],
          defaultOptions: {
            templateOptions: {
              type: 'text',
              rowCount: 1,
            },
          },
        },
        {
          name: InputTypesConstants.stringUrlPath,
          component: StringUrlPathComponent,
          wrappers: ['form-field'],
          defaultOptions: {
            templateOptions: {
              type: 'text',
            },
          },
        }
      ],
      validators: [
        { name: 'onlySimpleUrlChars', validation: CustomValidators.onlySimpleUrlChars(true, true) },
      ],
      validationMessages: [
        { name: 'onlySimpleUrlChars', message: onlySimpleUrlCharsValidatorMessage },
        { name: 'required', message: 'This field is required' },
        { name: 'minlength', message: minlengthValidationMessage },
        { name: 'maxlength', message: maxlengthValidationMessage },
        { name: 'min', message: minValidationMessage },
        { name: 'max', message: maxValidationMessage },
      ],
    }),
  ],
})
export class EavFormlyMaterialModule { }
