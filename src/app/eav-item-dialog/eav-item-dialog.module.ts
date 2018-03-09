import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule, Store } from '@ngrx/store';
import { Routes, RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { ReactiveFormsModule } from '@angular/forms';
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
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';
import { EavMaterialControlsModule } from '../eav-material-controls/eav-material-controls.module';

const routes: Routes = [
  {
    path: '',
    component: MultiItemEditFormComponent
  }
];

@NgModule({
  declarations: [
    MultiItemEditFormComponent,
    ItemEditFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    EavDynamicFormModule,
    EavMaterialControlsModule
  ],
  exports: [RouterModule],
  providers: [],
})
export class EavItemDialogModule { }
