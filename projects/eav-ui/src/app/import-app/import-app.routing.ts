import { Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry';
import { importAppDialog } from './import-app-dialog.config';

export const importRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: importAppDialog }
  }
];

