import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EXPORT_CONTENT_TYPE_DIALOG } from '../shared/constants/dialog-names';
import { contentExportDialogConfig } from './content-export-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: EXPORT_CONTENT_TYPE_DIALOG, dialogConfig: contentExportDialogConfig
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentExportRoutingModule { }
