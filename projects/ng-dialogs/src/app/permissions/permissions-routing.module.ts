import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { edit } from '../../../../edit/edit.matcher';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { permissionsDialog } from './permissions-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: permissionsDialog }, children: [
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
