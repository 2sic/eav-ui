import { Routes } from '@angular/router';
import { EditRoutesRoot } from './edit/edit.routing';

// WIP EXPERIMENTAL 2DM v18.03

// const zoneOnly = ':zoneId';
// const zoneFull = `:zoneId/v2/:moduleId/:blockId`;
const zoneApp = `:zoneId/:appId`;
const full = `:zoneId/v2/:moduleId/:blockId/:appId`;

export const routes: Routes = [
  // {
  //   path: `${zoneOnly}/apps`,
  //   loadChildren: () => import('./apps-management/apps-management.routing').then(m => m.appsManagementRoutes),
  //   data: { title: 'Apps' },
  // },
  // {
  //   path: `${zoneFull}/apps`,
  //   loadChildren: () => import('./apps-management/apps-management.routing').then(m => m.appsManagementRoutes),
  //   data: { title: 'Apps' },
  // },
  {
    path: `${full}/apps`,
    loadChildren: () => import('./apps-management/apps-management.routing').then(m => m.appsManagementRoutes),
    data: { title: 'Apps' },
  },
  // {
  //   path: `${zoneOnly}/import`,
  //   loadChildren: () => import('./import-app/import-app.routing').then(m => m.importRoutes),
  //   data: { title: 'Import App' },
  // },
  // {
  //   path: `${zoneFull}/import`,
  //   loadChildren: () => import('./import-app/import-app.routing').then(m => m.importRoutes),
  //   data: { title: 'Import App' },
  // },
  {
    path: `${full}/import`,
    loadChildren: () => import('./import-app/import-app.routing').then(m => m.importRoutes),
    data: { title: 'Import App' },
  },

  // OLD - probably still in use...
  {
    path: `${zoneApp}/app`,
    loadChildren: () => import('./app-administration/app-administration.routing').then(m => m.appAdministrationRoutes),
    data: { title: 'App' },
  },
  // New
  {
    path: `${full}/app`,
    loadChildren: () => import('./app-administration/app-administration.routing').then(m => m.appAdministrationRoutes),
    data: { title: 'App' },
  },
  { // New
    path: `${full}/code`,
    loadChildren: () => import('./code-editor/code-editor.routing').then(m => m.codeEditorRoutes),

    data: { title: 'Code Editor' },
  },
  // { // Old
  //   path: `${zoneApp}/code`,
  //   loadChildren: () => import('./code-editor/code-editor.routing').then(m => m.codeEditorRoutes),

  //   data: { title: 'Code Editor' },
  // },
  { // New
    path: `${full}/query/:pipelineId`,
    loadChildren: () => import('./visual-query/visual-query.routing').then(m => m.visualQueryRoutes),
    data: { title: 'Visual Query' },
  },
  // { // Old
  //   path: `${zoneApp}/query/:pipelineId`,
  //   loadChildren: () => import('./visual-query/visual-query.routing').then(m => m.visualQueryRoutes),
  //   data: { title: 'Visual Query' },
  // },
  { // New
    path: `${full}/:guid/:part/:index/replace`,
    loadChildren: () => import('./replace-content/replace-content.routing').then(m => m.replaceContentRoutes),

    data: { title: 'Apps' },
  },
  // { // Old
  //   path: `${zoneApp}/:guid/:part/:index/replace`,
  //   loadChildren: () => import('./replace-content/replace-content.routing').then(m => m.replaceContentRoutes),
  //   data: { title: 'Apps' },
  // },
  { // New
    path: `${full}/:guid/:part/:index/reorder`,
    loadChildren: () => import('./manage-content-list/manage-content-list.routing').then(m => m.manageContentRoutes),
    data: { title: 'Reorder Items' },
  },
  // { // Old
  //   path: `${zoneApp}/:guid/:part/:index/reorder`,
  //   loadChildren: () => import('./manage-content-list/manage-content-list.routing').then(m => m.manageContentRoutes),
  //   data: { title: 'Reorder Items' },
  // },
  { // New
    path: `${full}/items/:contentTypeStaticName`,
    loadChildren: () => import('./content-items/content-items.routing').then(m => m.contentItemsRoutes),
    data: { title: 'Items' },
  },
  // { // Old
  //   path: `${zoneApp}/items/:contentTypeStaticName`,
  //   loadChildren: () => import('./content-items/content-items.routing').then(m => m.contentItemsRoutes),
  //   data: { title: 'Items' },
  // },
  { // New
    path: `${full}/fields/:contentTypeStaticName`,
    loadChildren: () => import('./content-type-fields/content-type-fields.routing').then(m => m.contentTypeFieldsRoutes),
    data: { title: 'Fields' },
  },
  // { // Old
  //   path: `${zoneApp}/fields/:contentTypeStaticName`,
  //   loadChildren: () => import('./content-type-fields/content-type-fields.routing').then(m => m.contentTypeFieldsRoutes),
  //   data: { title: 'Fields' },
  // },
  { // New
    path: `${full}/versions/:itemId`,
    loadChildren: () => import('./item-history/item-history.routing').then(m => m.historyRoutes),
  },
  // { // Old
  //   path: `${zoneApp}/versions/:itemId`,
  //   loadChildren: () => import('./item-history/item-history.routing').then(m => m.historyRoutes),
  // },
  ...EditRoutesRoot,
];

