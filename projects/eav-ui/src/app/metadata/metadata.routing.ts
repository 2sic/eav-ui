import { Routes } from '@angular/router';
import { edit, refreshEdit } from '../edit/edit.matcher';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { metadataDialog } from './metadata-dialog.config';

export const metadataRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: metadataDialog },
    children: [
      {
        matcher: edit,
        loadChildren: () => import('../edit/edit.module').then(m => m.EditModule)
      },
      {
        matcher: refreshEdit,
        loadChildren: () => import('../edit/refresh-edit.module').then(m => m.RefreshEditModule)
      },
    ]
  },
];

