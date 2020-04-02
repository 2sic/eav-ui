import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { manageContentListDialog } from './manage-content-list-dialog.config';
import { edit } from '../../../../edit/edit.matcher';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: manageContentListDialog }, children: [
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
export class ManageContentListRoutingModule { }
