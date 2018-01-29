import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule, Store } from '@ngrx/store';
import { Routes, RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FieldWrapper } from '@ngx-formly/core';

import { itemReducer, contentTypeReducer } from '../shared/store/reducers';
import { MultiItemEditFormComponent } from './multi-item-edit-form/multi-item-edit-form.component';
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';
import { MatButtonModule, MatCheckboxModule, MatInputModule } from '@angular/material';
import { ItemEffects } from '../shared/effects/item.effects';
import { ContentType } from '../shared/models/eav/content-type';
// import { PanelWrapperComponent } from '../shared/wrappers/panel-wrapper/panel-wrapper.component';

import { FormlyMaterialModule } from '@ngx-formly/material';

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
    // TODO: some of depedencies are 2 times added - need core module
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule,
    FormlyModule,
    // FormlyModule.forRoot({
    //   wrappers: [
    //     { name: 'panel', component: PanelWrapperComponent },
    //   ],
    // }),
    // StoreModule.forFeature('eav-item-dialog', { items: itemReducer, contentTypes: contentTypeReducer })
  ],
  declarations: [MultiItemEditFormComponent, ItemEditFormComponent], // PanelWrapperComponent
  exports: [RouterModule]
})
export class EavItemDialogModule { }
