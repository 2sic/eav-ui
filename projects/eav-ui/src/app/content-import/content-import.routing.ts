import { Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { contentImportDialog } from './content-import-dialog.config';

export const contentImportRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: contentImportDialog }
  },
];

