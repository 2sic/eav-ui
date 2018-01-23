import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { EavItemDialogRoutingModule } from './eav-item-dialog-routing.module';
import { StoreModule } from '@ngrx/store';

import { itemReducer, contentTypeReducer } from '../shared/store/reducers';
import { MultiItemEditFormComponent } from './multi-item-edit-form/multi-item-edit-form.component';
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';

import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: MultiItemEditFormComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
    // StoreModule.forFeature('EavItemDialog', { items: itemReducer, contentTypes: contentTypeReducer })
  ],
  declarations: [MultiItemEditFormComponent, ItemEditFormComponent],
  exports: [RouterModule]
})
export class EavItemDialogModule { }
