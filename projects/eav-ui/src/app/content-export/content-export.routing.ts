import { Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { contentExportDialog } from './content-export-dialog.config';

export const ContentExportRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: contentExportDialog }
  },
];
