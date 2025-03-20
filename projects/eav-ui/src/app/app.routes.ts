import { Routes } from '@angular/router';
import { EditRoutesRoot } from './edit/edit.routing';

const zoneApp = `:zoneId/:appId`;
const full = `:zoneId/v2/:moduleId/:blockId/:appId`;

export const routes: Routes = [
  // OLD - maybe still in use... (this is only use of `zoneApp`, can probably be removed but must be tested)
  {
    path: `${zoneApp}/app`,
    loadChildren: () => import('./app-administration/app-administration.routing').then(m => m.appAdministrationRoutes),
    data: { title: 'App' },
  },

  // NEW
  
  {
    path: `${full}/apps`,
    loadChildren: () => import('./apps-management/apps-management.routing').then(m => m.appsManagementRoutes),
    data: { title: 'Apps' },
  },
  {
    path: `${full}/import`,
    loadChildren: () => import('./import-app/import-app.routing').then(m => m.importRoutes),
    data: { title: 'Import App' },
  },
 
  {
    path: `${full}/app`,
    loadChildren: () => import('./app-administration/app-administration.routing').then(m => m.appAdministrationRoutes),
    data: { title: 'App' },
  },
  {
    path: `${full}/code`,
    loadChildren: () => import('./code-editor/code-editor.routing').then(m => m.codeEditorRoutes),

    data: { title: 'Code Editor' },
  },
  {
    path: `${full}/query/:pipelineId`,
    loadChildren: () => import('./visual-query/visual-query.routing').then(m => m.visualQueryRoutes),
    data: { title: 'Visual Query' },
  },
  {
    path: `${full}/:guid/:part/:index/replace`,
    loadChildren: () => import('./replace-content/replace-content.routing').then(m => m.replaceContentRoutes),

    data: { title: 'Apps' },
  },
  {
    path: `${full}/:guid/:part/:index/reorder`,
    loadChildren: () => import('./manage-content-list/manage-content-list.routing').then(m => m.manageContentRoutes),
    data: { title: 'Reorder Items' },
  },
  {
    path: `${full}/items/:contentTypeStaticName`,
    loadChildren: () => import('./content-items/content-items.routing').then(m => m.contentItemsRoutes),
    data: { title: 'Items' },
  },
  {
    path: `${full}/fields/:contentTypeStaticName`,
    loadChildren: () => import('./content-type-fields/content-type-fields.routing').then(m => m.contentTypeFieldsRoutes),
    data: { title: 'Fields' },
  },
  {
    path: `${full}/versions/:itemId`,
    loadChildren: () => import('./item-history/item-history.routing').then(m => m.historyRoutes),
  },
  ...EditRoutesRoot,
];

