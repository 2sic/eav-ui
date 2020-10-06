import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { devRestDialog } from './dev-rest-dialog.config';

const routes: Routes = [
  { path: '', component: DialogEntryComponent, data: { dialog: devRestDialog, title: 'REST API' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevRestRoutingModule { }
