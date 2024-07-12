import { Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { permissionsDialog } from './permissions-dialog.config';
import { EditRoutesSubItems } from '../edit/edit.routing';

export const permissionRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: permissionsDialog },
    children: EditRoutesSubItems
  },
];
