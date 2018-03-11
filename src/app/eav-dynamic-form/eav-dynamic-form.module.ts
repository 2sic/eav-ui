import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EavFieldDirective } from './components/eav-field/eav-field.directive';
import { EavFormComponent } from './components/eav-form/eav-form.component';
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
    ],
    exports: [
        EavFormComponent
    ],
})
export class EavDynamicFormModule { }
