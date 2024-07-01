import { Routes } from '@angular/router';
import { editRouteMatcherSubEdit } from '../edit/edit.matcher';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { replaceContentDialog } from './replace-content-dialog.config';

export const replaceContentRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: replaceContentDialog },
    children: [
      {
        matcher: editRouteMatcherSubEdit,
        loadChildren: () => import('../edit/edit.module').then(m => m.EditModule),
        data: { history: false },
      },
    ]
  },
];
