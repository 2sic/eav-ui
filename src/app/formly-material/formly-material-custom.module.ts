import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule, MatCheckboxModule, MatInputModule } from '@angular/material';

import { PanelWrapperComponent } from './wrappers/panel-wrapper/panel-wrapper.component';
import { LabelWrapperComponent } from './wrappers/label-wrapper/label-wrapper.component';
import { CollapsibleWrapperComponent } from './wrappers/collapsible-wrapper/collapsible-wrapper.component';
import { HorizontalInputWrapperComponent } from './wrappers/horizontal-input-wrapper/horizontal-input-wrapper.component';
import { FormlyWrapperFormField, FormlyFieldInput, FormlyMaterialModule } from '@ngx-formly/material';
import { StringDefaultComponent } from './field-types/string-default/string-default.component';

@NgModule({
  declarations: [
    // wrappers
    PanelWrapperComponent,
    LabelWrapperComponent,
    CollapsibleWrapperComponent,
    HorizontalInputWrapperComponent,
    // types
    StringDefaultComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,

    FormlyModule.forRoot({
      wrappers: [
        { name: 'panel', component: PanelWrapperComponent },
        { name: 'label', component: LabelWrapperComponent },
        { name: 'collapsible', component: CollapsibleWrapperComponent },
        { name: 'horizontalWrapper', component: HorizontalInputWrapperComponent },
        { name: 'form-field', component: FormlyWrapperFormField }
      ],
      types: [
        {
          name: 'horizontalInput',
          extends: 'input',
          wrappers: ['form-field', 'horizontalWrapper']
        },
        {
          name: 'string-default',
          component: StringDefaultComponent,
          wrappers: ['form-field']
        }
      ],
    }),
  ],
})
export class FormlyMaterialCustomModule { }
