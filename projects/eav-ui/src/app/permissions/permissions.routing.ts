import { Routes } from '@angular/router';
import { EditRoutes } from '../edit/edit.routing';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry';
import { permissionsDialog } from './permissions-dialog.config';

export const permissionRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: permissionsDialog },
    children: EditRoutes
  },
];
