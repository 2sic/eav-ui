import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { importAppDialog } from './import-app-dialog.config';

const routes: Routes = [
  { path: '', component: DialogEntryComponent, data: { dialog: importAppDialog } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportAppRoutingModule { }
