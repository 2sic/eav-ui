import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { edit, refreshEdit } from '../edit/edit.matcher';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { manageContentListDialog } from './manage-content-list-dialog.config';

export const manageContentRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: manageContentListDialog },
    children: [
      {
        matcher: edit,
        loadChildren: () => import('../edit/edit.module').then(m => m.EditModule)
      },
      {
        matcher: refreshEdit,
        loadChildren: () => import('../edit/refresh-edit.module').then(m => m.RefreshEditModule)
      },
      {
        path: ':guid/:part/:index/replace',
        loadChildren: () => import('../replace-content/replace-content-routing.module').then(m => m.replaceContentRoutes)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(manageContentRoutes)],
  exports: [RouterModule]
})
export class ManageContentListRoutingModule { }
