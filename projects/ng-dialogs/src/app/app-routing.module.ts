import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { editRoot } from '../../../edit/edit.matcher';

const appRoutes: Routes = [
  {
    path: ':zoneId/apps',
    loadChildren: () => import('./apps-management/apps-management.module').then(m => m.AppsManagementModule),
    data: { title: 'Apps' },
  },
  {
    path: ':zoneId/import',
    loadChildren: () => import('./import-app/import-app.module').then(m => m.ImportAppModule),
    data: { title: 'Import App' },
  },
  {
    path: ':zoneId/:appId/app',
    loadChildren: () => import('./app-administration/app-administration.module').then(m => m.AppAdministrationModule),
    data: { title: 'App' },
  },
  {
    path: ':zoneId/:appId/code',
    loadChildren: () => import('./code-editor/code-editor.module').then(m => m.CodeEditorModule),
    data: { title: 'Code Editor' },
  },
  {
    path: ':zoneId/:appId/query/:pipelineId',
    loadChildren: () => import('./visual-query/visual-query.module').then(m => m.VisualQueryModule),
    data: { title: 'Visual Query' },
  },
  {
    path: ':zoneId/:appId/:guid/:part/:index/replace',
    loadChildren: () => import('./replace-content/replace-content.module').then(m => m.ReplaceContentModule),
    data: { title: 'Apps' },
  },
  {
    path: ':zoneId/:appId/:guid/:part/:index/reorder',
    loadChildren: () => import('./manage-content-list/manage-content-list.module').then(m => m.ManageContentListModule),
    data: { title: 'Reorder Items' },
  },
  {
    path: ':zoneId/:appId/items/:contentTypeStaticName',
    loadChildren: () => import('./content-items/content-items.module').then(m => m.ContentItemsModule),
    data: { title: 'Items' },
  },
  {
    path: ':zoneId/:appId/fields/:contentTypeStaticName',
    loadChildren: () => import('./content-type-fields/content-type-fields.module').then(m => m.ContentTypeFieldsModule),
    data: { title: 'Fields' },
  },
  {
    matcher: editRoot,
    loadChildren: () => import('../../../edit/edit.module').then(m => m.EditModule),
    data: { title: 'Edit Item' },
  },
  // routes below are not linked directly from the initializer and are used for testing
  // to make sure each module contains enough data to be self sustainable
  {
    path: ':zoneId/:appId/export/:contentTypeStaticName',
    loadChildren: () => import('./content-export/content-export.module').then(m => m.ContentExportModule),
    data: { title: 'Export Items' },
  },
  {
    path: ':zoneId/:appId/export/:contentTypeStaticName/:selectedIds',
    loadChildren: () => import('./content-export/content-export.module').then(m => m.ContentExportModule),
    data: { title: 'Export Items' },
  },
  {
    path: ':zoneId/:appId/permissions/:type/:keyType/:key',
    loadChildren: () => import('./permissions/permissions.module').then(m => m.PermissionsModule),
    data: { title: 'Permissions' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
