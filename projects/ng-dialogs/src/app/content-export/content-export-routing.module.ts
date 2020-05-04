import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { contentExportDialog } from './content-export-dialog.config';

const routes: Routes = [
  { path: '', component: DialogEntryComponent, data: { dialog: contentExportDialog } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentExportRoutingModule { }
