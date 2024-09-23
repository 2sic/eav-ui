import { Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { manageContentListDialog } from './manage-content-list-dialog.config';
import { EditRoutes } from '../edit/edit.routing';

export const manageContentRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: manageContentListDialog },
    children: [
      ...EditRoutes,
      {
        path: ':guid/:part/:index/replace',
        loadChildren: () => import('../replace-content/replace-content.routing').then(m => m.replaceContentRoutes)
      },
    ]
  },
];

