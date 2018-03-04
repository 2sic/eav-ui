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
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule,
  MatIconModule
} from '@angular/material';

import { MultiItemEditFormComponent } from './multi-item-edit-form/multi-item-edit-form.component';
import { EavDynamicFormModule } from '../eav-dynamic-form/eav-dynamic-form.module';
import { EavFormlyMaterialModule } from '../eav-formly-material/eav-formly-material.module';
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';

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
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    EavDynamicFormModule,
    EavFormlyMaterialModule
  ],
  declarations: [
    MultiItemEditFormComponent,
    ItemEditFormComponent
  ],
  exports: [RouterModule],
  providers: [],
})
export class EavItemDialogModule { }
