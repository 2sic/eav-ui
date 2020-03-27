import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
// tslint:disable-next-line:max-line-length
import { APP_ADMINISTRATION_DIALOG, EDIT_CONTENT_TYPE_DIALOG, EXPORT_CONTENT_TYPE_DIALOG, IMPORT_CONTENT_TYPE_DIALOG, IMPORT_QUERY_DIALOG, EXPORT_APP, EXPORT_APP_PARTS, IMPORT_APP_PARTS } from '../shared/constants/dialog-names';
import { edit } from '../../../../edit/edit.matcher';
import { appAdministrationDialogConfig } from './app-administration-nav/app-administration-dialog.config';
import { editContentTypeDialogConfig } from './shared/modals/edit-content-type/edit-content-type-dialog.config';
import { contentExportDialogConfig } from '../content-items/content-export/content-export-dialog.config';
import { contentImportDialogConfig } from './shared/modals/content-import/content-import-dialog.config';
import { importQueryDialogConfig } from './shared/modals/import-query/import-query-dialog.config';
import { exportAppDialogConfig } from './shared/modals/export-app/export-app-dialog.config';
import { exportAppPartsDialogConfig } from './shared/modals/export-app-parts/export-app-parts-dialog.config';
import { importAppPartsDialogConfig } from './shared/modals/import-app-parts/import-app-parts-dialog.config';

const appAdministrationRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: APP_ADMINISTRATION_DIALOG, dialogConfig: appAdministrationDialogConfig
    }, children: [
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
          {
            path: ':scope/add', component: DialogEntryComponent, data: {
              dialogName: EDIT_CONTENT_TYPE_DIALOG, dialogConfig: editContentTypeDialogConfig
            }
          },
          {
            path: ':scope/:id/edit', component: DialogEntryComponent, data: {
              dialogName: EDIT_CONTENT_TYPE_DIALOG, dialogConfig: editContentTypeDialogConfig
            }
          },
          {
            path: 'fields/:contentTypeStaticName',
            loadChildren: () => import('../content-type-fields/content-type-fields.module').then(m => m.ContentTypeFieldsModule)
          },
          {
            path: ':contentTypeStaticName/export', component: DialogEntryComponent, data: {
              dialogName: EXPORT_CONTENT_TYPE_DIALOG, dialogConfig: contentExportDialogConfig
            }
          },
          {
            path: ':contentTypeStaticName/import', component: DialogEntryComponent, data: {
              dialogName: IMPORT_CONTENT_TYPE_DIALOG, dialogConfig: contentImportDialogConfig
            }
          },
          {
            path: 'permissions/:type/:keyType/:key',
            loadChildren: () => import('../permissions/permissions.module').then(m => m.PermissionsModule)
          },
        ]
      },
      {
        path: 'queries', component: EmptyRouteComponent, children: [
          {
            path: 'import', component: DialogEntryComponent, data: {
              dialogName: IMPORT_QUERY_DIALOG, dialogConfig: importQueryDialogConfig
            }
          },
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
          {
            path: 'export', component: DialogEntryComponent, data: {
              dialogName: EXPORT_APP, dialogConfig: exportAppDialogConfig
            }
          },
          {
            path: 'export/parts', component: DialogEntryComponent, data: {
              dialogName: EXPORT_APP_PARTS, dialogConfig: exportAppPartsDialogConfig
            }
          },
          {
            path: 'import/parts', component: DialogEntryComponent, data: {
              dialogName: IMPORT_APP_PARTS, dialogConfig: importAppPartsDialogConfig
            }
          },
        ]
      },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(appAdministrationRoutes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppAdministrationRoutingModule { }
