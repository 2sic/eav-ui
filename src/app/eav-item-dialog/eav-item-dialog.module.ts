import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { Routes, RouterModule } from '@angular/router';

import { itemReducer, contentTypeReducer } from '../shared/store/reducers';
import { MultiItemEditFormComponent } from './multi-item-edit-form/multi-item-edit-form.component';
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';

import { MatButtonModule, MatCheckboxModule, MatInputModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';


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
    ReactiveFormsModule,
    FormlyModule
    // StoreModule.forFeature('EavItemDialog', { items: itemReducer, contentTypes: contentTypeReducer })
  ],
  declarations: [MultiItemEditFormComponent, ItemEditFormComponent],
  exports: [RouterModule]
})
export class EavItemDialogModule { }
