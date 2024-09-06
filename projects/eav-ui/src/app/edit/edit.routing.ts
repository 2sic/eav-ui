import { Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { editDialog } from './edit-dialog.config';
import { editRouteMatcherRoot, editRouteMatcherSubEdit, editRouteMatcherSubEditRefresh, editRouteMatcherRootRefresh } from './routing/edit-route-matchers';
import { EavLogger } from '../shared/logging/eav-logger';

const logThis = false;
const logger = new EavLogger('EditRoutingModule', logThis);


export const EditRoutesSubItems: Routes = [
  {
    matcher: editRouteMatcherSubEdit,
    loadChildren: () => {
      // Recursively use these routes again.
      logger.a('loadChildren - matcher: sub-edit');
      return EditRoutes;
    },
  },
  {
    matcher: editRouteMatcherSubEditRefresh,
    loadChildren: () => import('./refresh-edit.module').then(m => m.RefreshEditModule)
  },
];

/**
 * In some cases the history could cause trouble, eg. in VisualQuery, where there are many hidden fields which
 * build the query, and if someone goes back in time thinking they are just changing the labels, the query would break.
 * 
 * So this is a route without the history-restore/refresh mechanism.
 */
export const EditRoutesSubItemsNoHistory: Routes = [
  {
    matcher: editRouteMatcherSubEdit,
    loadChildren: () => EditRoutes,
    data: { history: false },
  },
];

/**
 * The main routes for the Edit Dialog.
 * It will
 * 1. load the EntryComponent
 * 2. watch routes for sub-items.
 * 3. enable the history mechanism.
 */
const EditRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: editDialog },
    children: [
      ...EditRoutesSubItems,
      {
        path: 'versions/:itemId',
        loadChildren: () => import('../item-history/item-history.routing').then(m => m.historyRoutes),
      }
    ],
  },
];

/**
 * Root routes only meant for the entry points of the application, "App" and "Apps"
 */
export const EditRoutesRoot: Routes = [
  {
    matcher: editRouteMatcherRoot,
    loadChildren: () => EditRoutes,
  },
  {
    matcher: editRouteMatcherRootRefresh,
    loadChildren: () => import('../edit/refresh-edit.module').then(m => m.RefreshEditModule)
  },
];