import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { itemHistoryDialog } from './item-history-dialog.config';

const routes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: itemHistoryDialog, title: 'Item History' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemHistoryRoutingModule { }
