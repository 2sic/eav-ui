import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule, Store } from '@ngrx/store';
import { Routes, RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FieldWrapper } from '@ngx-formly/core';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatInputModule,
  MatSelectModule,
  // MatDialogModule,
  // MatDialog,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule,
  MatIconModule
} from '@angular/material';

import { MultiItemEditFormComponent } from './multi-item-edit-form/multi-item-edit-form.component';
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';
import { EavFormlyField } from '../eav-formly-material/formly/core/eav-formly-field.component';
import { EavFormlyForm } from '../eav-formly-material/formly/core/eav-formly-form.component';
// import { FormlyFormExpression } from '../eav-formly-material/formly/core/formly-form-expression';

const routes: Routes = [
  {
    path: '',
    component: MultiItemEditFormComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormlyModule,
    // MatDialogModule
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule
  ],
  declarations: [
    MultiItemEditFormComponent,
    ItemEditFormComponent,
    EavFormlyField, //TEMP
    EavFormlyForm //TEMP
  ],
  exports: [RouterModule, EavFormlyForm, EavFormlyField],
  providers: [],
})
export class EavItemDialogModule { }
