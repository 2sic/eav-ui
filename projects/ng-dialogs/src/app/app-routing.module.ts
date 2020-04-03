import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { editRoot } from '../../../edit/edit.matcher';

const appRoutes: Routes = [
  {
    path: ':zoneId/apps',
    loadChildren: () => import('./apps-management/apps-management.module').then(m => m.AppsManagementModule)
  },
  {
    path: ':zoneId/:appId/app',
    loadChildren: () => import('./app-administration/app-administration.module').then(m => m.AppAdministrationModule)
  },
  {
    path: ':zoneId/:appId/code',
    loadChildren: () => import('./code-editor/code-editor.module').then(m => m.CodeEditorModule)
  },
  {
    path: ':zoneId/:appId/:guid/:part/:index/replace',
    loadChildren: () => import('./replace-content/replace-content.module').then(m => m.ReplaceContentModule)
  },
  {
    path: ':zoneId/:appId/:guid/:part/:index/reorder',
    loadChildren: () => import('./manage-content-list/manage-content-list.module').then(m => m.ManageContentListModule)
  },
  {
    path: ':zoneId/:appId/items/:contentTypeStaticName',
    loadChildren: () => import('./content-items/content-items.module').then(m => m.ContentItemsModule)
  },
  {
    path: ':zoneId/:appId/fields/:contentTypeStaticName',
    loadChildren: () => import('./content-type-fields/content-type-fields.module').then(m => m.ContentTypeFieldsModule)
  },
  {
    matcher: editRoot,
    loadChildren: () => import('../../../edit/edit.module').then(m => m.EditModule)
  },
  // routes below are not linked directly from the initializer and are used for testing
  // to make sure each module contains enough data to be self sustainable
  {
    path: ':zoneId/:appId/export/:contentTypeStaticName',
    loadChildren: () => import('./content-export/content-export.module').then(m => m.ContentExportModule)
  },
  {
    path: ':zoneId/:appId/export/:contentTypeStaticName/:selectedIds',
    loadChildren: () => import('./content-export/content-export.module').then(m => m.ContentExportModule)
  },
  {
    path: ':zoneId/:appId/permissions/:type/:keyType/:key',
    loadChildren: () => import('./permissions/permissions.module').then(m => m.PermissionsModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
