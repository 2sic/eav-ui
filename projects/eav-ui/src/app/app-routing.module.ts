import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { editRouteMatcherRoot, editRouteMatcherRootRefresh } from './edit/edit.matcher';

const appRoutes: Routes = [
  {
    path: ':zoneId/apps',
    loadChildren: () => import('./apps-management/apps-management.routing').then(m => m.appsManagementRoutes),

    data: { title: 'Apps' },
  },
  {
    path: ':zoneId/import',
    loadChildren: () => import('./import-app/import-app.routing').then(m => m.importRoutes),
    data: { title: 'Import App' },
  },
  {
    path: ':zoneId/:appId/app',
    loadChildren: () => import('./app-administration/app-administration.module').then(m => m.AppAdministrationModule),
    data: { title: 'App' },
  },
  {
    path: ':zoneId/:appId/code',
    loadChildren: () => import('./code-editor/code-editor.routing').then(m => m.codeEditorRoutes),

    data: { title: 'Code Editor' },
  },
  {
    path: ':zoneId/:appId/query/:pipelineId',
    loadChildren: () => import('./visual-query/visual-query.routing').then(m => m.visualQueryRoutes),
    data: { title: 'Visual Query' },
  },
  {
    path: ':zoneId/:appId/:guid/:part/:index/replace',
    loadChildren: () => import('./replace-content/replace-content.routing').then(m => m.replaceContentRoutes),

    data: { title: 'Apps' },
  },
  {
    path: ':zoneId/:appId/:guid/:part/:index/reorder',
    loadChildren: () => import('./manage-content-list/manage-content-list.routing').then(m => m.manageContentRoutes),
    data: { title: 'Reorder Items' },
  },
  {
    path: ':zoneId/:appId/items/:contentTypeStaticName',
    loadChildren: () => import('./content-items/content-items.routing').then(m => m.contentItemsRoutes),
    data: { title: 'Items' },
  },
  {
    path: ':zoneId/:appId/fields/:contentTypeStaticName',
    loadChildren: () => import('./content-type-fields/content-type-fields.routing').then(m => m.contentTypeFieldsRoutes),
    data: { title: 'Fields' },
  },
  {
    path: ':zoneId/:appId/versions/:itemId',
    loadChildren: () => import('./item-history/item-history.routing').then(m => m.historyRoutes),
  },
  {
    matcher: editRouteMatcherRoot,
    // loadChildren: () => import('./edit/edit.module').then(m => m.EditModule),
    loadChildren: () => import('./edit/edit-routing.module').then(m => m.EditRoutes),
    data: { title: 'Edit Item' },
  },
  {
    matcher: editRouteMatcherRootRefresh,
    loadChildren: () => import('./edit/refresh-edit.module').then(m => m.RefreshEditModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
