import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EavFieldDirective } from './components/eav-field/eav-field.directive';
import { EavFormComponent } from './components/eav-form/eav-form.component';
import { FormInputComponent } from './components/inputs/form-input/form-input.component';
import { FieldTypeConfig } from './services/field-type-config.service';
import { FieldWrapperComponent } from './components/wrappers/field-wrapper/field-wrapper.component';
import { FieldParentWrapperComponent } from './components/wrappers/field-parent-wrapper/field-parent-wrapper.component';
import {
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,

        MatFormFieldModule,
        MatButtonModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatIconModule,
    ],
    declarations: [
        EavFieldDirective,
        EavFormComponent,
        FormInputComponent,
        FieldWrapperComponent,
        FieldParentWrapperComponent
    ],
    exports: [
        EavFormComponent
    ],
    entryComponents: [
        FormInputComponent,
        FieldWrapperComponent,
        FieldParentWrapperComponent
    ],
    providers: [
        FieldTypeConfig
    ]
})
export class EavDynamicFormModule { }
