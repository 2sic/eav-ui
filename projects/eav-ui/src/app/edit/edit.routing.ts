import { Routes } from '@angular/router';
import { classLog } from '../shared/logging';
import { editDialog } from './edit-dialog.config';
import { matchEditRoot, matchEditRootRefresh, matchEditRootRefreshV2, matchEditRootV2, matchEditSub, matchEditSubRefresh } from './routing/edit-route-matchers';

const log = classLog('Routes');

/**
 * Routes which open an empty component which then reloads the entity to ensure a full refresh.
 * This is used on the history dialog, to ensure the restored data is fully reloaded.
 */
const reloadRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./routing/edit-reload.component').then(m => m.EditReloadComponent),
    data: { title: 'Reloading Edit Dialog' }
  },
];


/**
 * The main routes for the Edit Dialog.
 * It must always be attached to a /edit/:items route.
 * It will
 * 1. load the EntryComponent
 * 2. watch routes for sub-items.
 * 3. enable the history mechanism.
 */
const editRoutesDialogAndChildren: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/components/dialog-entry/dialog-entry').then(m => m.DialogEntryComponent),
    data: { dialog: editDialog },
    loadChildren: () => [
      ...EditRoutes,
      {
        path: 'versions/:itemId',
        loadChildren: () => import('../item-history/item-history.routing').then(m => m.historyRoutes),
      }
    ],
  },
];

/**
 * Routes for the Edit Dialog.
 * It will handle /edit/:items routes and also /edit/refresh/ routes.
 */
export const EditRoutes: Routes = [
  {
    matcher: matchEditSub,
    loadChildren: () => {
      // Recursively use these routes again.
      log.a('loadChildren - matcher: sub-edit');
      return editRoutesDialogAndChildren;
    },
  },
  {
    matcher: matchEditSubRefresh,
    children: reloadRoutes,
  },
];

/**
 * In some cases the history could cause trouble, eg. in VisualQuery, where there are many hidden fields which
 * build the query, and if someone goes back in time thinking they are just changing the labels, the query would break.
 * 
 * So this is a route without the history-restore/refresh mechanism.
 */
export const EditRoutesNoHistory: Routes = [
  {
    matcher: matchEditSub,
    loadChildren: () => editRoutesDialogAndChildren,
    data: { history: false }, // disable history in the edit dialog
  },
];


/**
 * Root routes only meant for the entry points of the application, "App" and "Apps"
 */
export const EditRoutesRoot: Routes = [
  // { // Old
  //   matcher: matchEditRoot,
  //   loadChildren: () => editRoutesDialogAndChildren,
  // },
  { // New
    matcher: matchEditRootV2,
    loadChildren: () => editRoutesDialogAndChildren,
  },
  // { // Old
  //   matcher: matchEditRootRefresh,
  //   children: reloadRoutes,
  // },
  { // New
    matcher: matchEditRootRefreshV2,
    children: reloadRoutes,
  },
];


/**
 * Root routes only meant for the entry points of the application, "App" and "Apps"
 */
export const EditRoutesUnderAppsList: Routes = [
  { // Old
    matcher: matchEditRoot,
    loadChildren: () => editRoutesDialogAndChildren,
  },
  // { // New
  //   matcher: matchEditRootV2,
  //   loadChildren: () => editRoutesDialogAndChildren,
  // },
  { // Old
    matcher: matchEditRootRefresh,
    children: reloadRoutes,
  },
  // { // New
  //   matcher: matchEditRootRefreshV2,
  //   children: reloadRoutes,
  // },
];