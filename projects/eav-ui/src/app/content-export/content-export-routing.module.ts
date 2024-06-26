import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { contentExportDialog } from './content-export-dialog.config';

export const ContentExportRoutes: Routes = [
  {
    path: '',
    // TODO: @2DG - LAZY...
    component: DialogEntryComponent,
    data: { dialog: contentExportDialog }
  },
];

// @NgModule({
//   imports: [RouterModule.forChild(ContentExportRoutes)],
//   exports: [RouterModule]
// })
// export class ContentExportRoutingModule { }
