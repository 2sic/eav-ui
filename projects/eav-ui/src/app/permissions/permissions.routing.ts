import { Routes } from '@angular/router';
import { editRouteMatcherSubEdit, editRouteMatcherSubEditRefresh } from '../edit/edit.matcher';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { permissionsDialog } from './permissions-dialog.config';

export const permissionRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: permissionsDialog },
    children: [
      {
        matcher: editRouteMatcherSubEdit,
        loadChildren: () => import('../edit/edit.module').then(m => m.EditModule)
      },
      {
        matcher: editRouteMatcherSubEditRefresh,
        loadChildren: () => import('../edit/refresh-edit.module').then(m => m.RefreshEditModule)
      },
    ]
  },
];
