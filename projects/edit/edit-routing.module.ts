import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogEntryComponent } from '../ng-dialogs/src/app/shared/components/dialog-entry/dialog-entry.component';
import { editDialog } from './edit-dialog.config';
import { edit, refreshEdit } from './edit.matcher';

const editRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: editDialog }, children: [
      {
        matcher: edit,
        loadChildren: () => import('./edit.module').then(m => m.EditModule),
      },
      {
        matcher: refreshEdit,
        loadChildren: () => import('./refresh-edit.module').then(m => m.RefreshEditModule)
      },
      {
        path: 'versions/:itemId',
        loadChildren: () => import('../ng-dialogs/src/app/item-history/item-history.module').then(m => m.ItemHistoryModule),
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(editRoutes)],
  exports: [RouterModule]
})
export class EditRoutingModule { }
