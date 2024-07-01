import { Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { editDialog } from './edit-dialog.config';
import { editRouteMatcherSubEdit, editRouteMatcherSubEditRefresh } from './edit.matcher';
import { EavLogger } from '../shared/logging/eav-logger';

const logThis = true;
const logger = new EavLogger('EditRoutingModule', logThis);

export const EditRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: editDialog },
    children: [
      {
        matcher: editRouteMatcherSubEdit,
        loadChildren: () => {
          // Recursively use these routes again.
          logger.a('loadChildren - matcher: edit');
          return EditRoutes;
        },
      },
      {
        matcher: editRouteMatcherSubEditRefresh,
        loadChildren: () => import('./refresh-edit.module').then(m => m.RefreshEditModule)
      },
      {
        path: 'versions/:itemId',
        loadChildren: () => import('../item-history/item-history.routing').then(m => m.historyRoutes),
      }
    ],
  },
];
