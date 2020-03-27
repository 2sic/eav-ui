import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { SET_PERMISSIONS_DIALOG } from '../shared/constants/dialog-names';
import { permissionsDialogConfig } from './permissions-dialog.config';
import { edit } from '../../../../edit/edit.matcher';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: SET_PERMISSIONS_DIALOG, dialogConfig: permissionsDialogConfig
    }, children: [
      {
        matcher: edit,
        loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionsRoutingModule { }
