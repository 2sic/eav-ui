import { Routes } from '@angular/router';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry';
import { devRestDialog } from './dev-rest-dialog.config';
import { GoToDevRest } from './go-to-dev-rest';

export const devRestRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: {
      dialog: devRestDialog,
      title: 'REST API'
    },
    children: [
      /* This route is used in Visual Query to open REST as Dialog */
      {
        path: `query/:${GoToDevRest.paramQuery}`,
        loadComponent: () => import('./query/query.component').then(m => m.DevRestQueryComponent),
        children: [
          GoToPermissions.route,
        ]
      },
    ]
  },
];

