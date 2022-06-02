import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { contentImportDialog } from './content-import-dialog.config';

const routes: Routes = [
  { path: '', component: DialogEntryComponent, data: { dialog: contentImportDialog } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentImportRoutingModule { }
