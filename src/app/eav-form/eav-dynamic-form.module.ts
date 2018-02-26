import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EavFieldDirective } from './directives/eav-field.directive';
import { EavFormComponent } from './components/eav-form/eav-form.component';
import { FormInputComponent } from './components/inputs/form-input/form-input.component';
import { FieldTypeConfig } from './services/field-type-config.service';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    declarations: [
        EavFieldDirective,
        EavFormComponent,
        FormInputComponent,
    ],
    exports: [
        EavFormComponent
    ],
    entryComponents: [
        FormInputComponent
    ],
    providers: [
        FieldTypeConfig
    ]
})
export class EavDynamicFormModule { }
