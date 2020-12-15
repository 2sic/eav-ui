import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { edit, refreshEdit } from '../../../../edit/edit.matcher';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { replaceContentDialog } from './replace-content-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: replaceContentDialog }, children: [
      {
        matcher: edit,
        loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule),
        data: { history: false },
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReplaceContentRoutingModule { }
