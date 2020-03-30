import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../ng-dialogs/src/app/shared/components/dialog-entry/dialog-entry.component';
import { edit } from './edit.matcher';
import { editDialog } from './eav-item-dialog/multi-item-edit-form/edit-dialog.config';

const editRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: editDialog }, children: [
      {
        matcher: edit,
        loadChildren: () => import('./edit.module').then(m => m.EditModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(editRoutes)],
  exports: [RouterModule]
})
export class EditRoutingModule { }
