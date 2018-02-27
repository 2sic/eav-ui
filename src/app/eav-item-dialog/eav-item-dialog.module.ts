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
import { NewItemFormComponent } from './new-item-form/new-item-form.component';
import { EavDynamicFormModule } from '../eav-dynamic-form/eav-dynamic-form.module';
import { EavFormlyMaterialModule } from '../eav-formly-material/eav-formly-material.module';

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
    MatIconModule,
    EavDynamicFormModule,
    EavFormlyMaterialModule
  ],
  declarations: [
    MultiItemEditFormComponent,
    ItemEditFormComponent,
    NewItemFormComponent,

  ],
  exports: [RouterModule],
  providers: [],
})
export class EavItemDialogModule { }
