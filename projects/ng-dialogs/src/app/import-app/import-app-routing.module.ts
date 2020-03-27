import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { IMPORT_APP_DIALOG } from '../shared/constants/dialog-names';
import { importAppDialogConfig } from './import-app-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: IMPORT_APP_DIALOG, dialogConfig: importAppDialogConfig
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportAppRoutingModule { }
