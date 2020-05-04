import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { edit } from '../../../../edit/edit.matcher';
import { appAdministrationDialog } from './app-administration-nav/app-administration-dialog.config';
import { editContentTypeDialog } from './shared/modals/edit-content-type/edit-content-type-dialog.config';
import { contentImportDialog } from './shared/modals/content-import/content-import-dialog.config';
import { importQueryDialog } from './shared/modals/import-query/import-query-dialog.config';
import { exportAppDialog } from './shared/modals/export-app/export-app-dialog.config';
import { exportAppPartsDialog } from './shared/modals/export-app-parts/export-app-parts-dialog.config';
import { importAppPartsDialog } from './shared/modals/import-app-parts/import-app-parts-dialog.config';

const appAdministrationRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: appAdministrationDialog }, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: EmptyRouteComponent },
      {
        path: 'data', component: EmptyRouteComponent, children: [
          {
            path: 'items/:contentTypeStaticName',
            loadChildren: () => import('../content-items/content-items.module').then(m => m.ContentItemsModule)
          },
          {
            matcher: edit,
            loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
          },
          { path: ':scope/add', component: DialogEntryComponent, data: { dialog: editContentTypeDialog } },
          { path: ':scope/:id/edit', component: DialogEntryComponent, data: { dialog: editContentTypeDialog } },
          {
            path: 'fields/:contentTypeStaticName',
            loadChildren: () => import('../content-type-fields/content-type-fields.module').then(m => m.ContentTypeFieldsModule)
          },
          {
            path: 'export/:contentTypeStaticName',
            loadChildren: () => import('../content-export/content-export.module').then(m => m.ContentExportModule)
          },
          { path: ':contentTypeStaticName/import', component: DialogEntryComponent, data: { dialog: contentImportDialog } },
          {
            path: 'permissions/:type/:keyType/:key',
            loadChildren: () => import('../permissions/permissions.module').then(m => m.PermissionsModule)
          },
        ]
      },
      {
        path: 'queries', component: EmptyRouteComponent, children: [
          { path: 'import', component: DialogEntryComponent, data: { dialog: importQueryDialog } },
          {
            matcher: edit,
            loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
          },
          {
            path: 'permissions/:type/:keyType/:key',
            loadChildren: () => import('../permissions/permissions.module').then(m => m.PermissionsModule)
          },
        ]
      },
      {
        path: 'views', component: EmptyRouteComponent, children: [
          {
            matcher: edit,
            loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
          },
          {
            path: 'permissions/:type/:keyType/:key',
            loadChildren: () => import('../permissions/permissions.module').then(m => m.PermissionsModule)
          },
        ]
      },
      { path: 'web-api', component: EmptyRouteComponent },
      {
        path: 'app', component: EmptyRouteComponent, children: [
          {
            matcher: edit,
            loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
          },
          {
            path: 'fields/:contentTypeStaticName',
            loadChildren: () => import('../content-type-fields/content-type-fields.module').then(m => m.ContentTypeFieldsModule)
          },
          {
            path: 'permissions/:type/:keyType/:key',
            loadChildren: () => import('../permissions/permissions.module').then(m => m.PermissionsModule)
          },
          { path: 'export', component: DialogEntryComponent, data: { dialog: exportAppDialog } },
          { path: 'export/parts', component: DialogEntryComponent, data: { dialog: exportAppPartsDialog } },
          { path: 'import/parts', component: DialogEntryComponent, data: { dialog: importAppPartsDialog } },
        ]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(appAdministrationRoutes)],
  exports: [RouterModule]
})
export class AppAdministrationRoutingModule { }
