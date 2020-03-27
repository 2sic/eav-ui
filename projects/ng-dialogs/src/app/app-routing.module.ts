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
    path: ':zoneId/import',
    loadChildren: () => import('./import-app/import-app.module').then(m => m.ImportAppModule)
  },
  {
    path: ':zoneId/:appId/permissions/:type/:keyType/:key',
    loadChildren: () => import('./permissions/permissions.module').then(m => m.PermissionsModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppRoutingModule { }
