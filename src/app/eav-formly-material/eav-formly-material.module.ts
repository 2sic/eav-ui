import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
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
    FormFieldWrapperComponent
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
        }
      ],
    }),
  ],
})
export class EavFormlyMaterialModule { }
