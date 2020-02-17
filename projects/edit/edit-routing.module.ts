import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../ng-dialogs/src/app/shared/components/dialog-entry/dialog-entry.component';
import { ITEMS_EDIT_DIALOG } from '../ng-dialogs/src/app/shared/constants/dialog-names';
import { edit } from './edit.matcher';

const editRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialogName: ITEMS_EDIT_DIALOG }, children: [
      {
        matcher: edit, // 'edit/:items' or 'edit/:items'/:expandedFieldId'
        loadChildren: () => import('./edit.module').then(m => m.EditModule)
      },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(editRoutes),
  ],
  exports: [
    RouterModule,
  ]
})
export class EditRoutingModule { }
