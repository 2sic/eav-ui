import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoToDevRest } from '../dev-rest';
import { edit, refreshEdit } from '../edit/edit.matcher';
import { GoToMetadata } from '../metadata';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { appAdministrationDialog } from './app-administration-nav/app-administration-dialog.config';
import { analyzeSettingsDialog } from './sub-dialogs/analyze-settings/analyze-settings-dialog.config';
import { settingsItemDetailsDialog } from './sub-dialogs/analyze-settings/settings-item-details/settings-item-details.config';
import { editContentTypeDialog } from './sub-dialogs/edit-content-type/edit-content-type-dialog.config';
import { exportAppPartsDialog } from './sub-dialogs/export-app-parts/export-app-parts-dialog.config';
import { exportAppDialog } from './sub-dialogs/export-app/export-app-dialog.config';
import { importAppPartsDialog } from './sub-dialogs/import-app-parts/import-app-parts-dialog.config';
import { importContentTypeDialog } from './sub-dialogs/import-content-type/import-content-type-dialog.config';
import { importQueryDialog } from './sub-dialogs/import-query/import-query-dialog.config';
import { importViewDialog } from './sub-dialogs/import-view/import-view-dialog.config';
import { languagePermissionsDialog } from './sub-dialogs/language-permissions/language-permissions-dialog.config';
import { viewsUsageDialog } from './sub-dialogs/views-usage/views-usage-dialog.config';

const appAdministrationRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: appAdministrationDialog }, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: EmptyRouteComponent, data: { title: 'App Home', breadcrumb: 'Info', } },
      {
        path: 'data/:scope', component: EmptyRouteComponent, children: [
          {
            path: 'import',
            component: DialogEntryComponent,
            data: { dialog: importContentTypeDialog, title: 'Import Content Type' },
          },
          {
            path: 'items/:contentTypeStaticName',
            loadChildren: () => import('../content-items/content-items.module').then(m => m.ContentItemsModule)
          },
          {
            matcher: edit,
            loadChildren: () => import('../edit/edit.module').then(m => m.EditModule)
          },
          {
            matcher: refreshEdit,
            loadChildren: () => import('../edit/refresh-edit.module').then(m => m.RefreshEditModule)
          },
          {
            path: 'add',
            component: DialogEntryComponent,
            data: { dialog: editContentTypeDialog, title: 'Add Content Type' },
          },
          {
            path: ':contentTypeStaticName/edit',
            component: DialogEntryComponent,
            data: { dialog: editContentTypeDialog, title: 'Edit Content Type' },
          },
          ...GoToMetadata.getRoutes(),
          GoToDevRest.route,
          {
            path: 'fields/:contentTypeStaticName',
            loadChildren: () => import('../content-type-fields/content-type-fields.module').then(m => m.ContentTypeFieldsModule),
            data: { title: 'Content Type Fields' },
          },
          {
            path: 'export/:contentTypeStaticName',
            loadChildren: () => import('../content-export/content-export.module').then(m => m.ContentExportModule),
            data: { title: 'Export Items' },
          },
          {
            path: ':contentTypeStaticName/import',
            loadChildren: () => import('../content-import/content-import.module').then(m => m.ContentImportModule),
            data: { title: 'Import Items' },
          },
          GoToPermissions.route,
        ],
        data: { title: 'App Data', breadcrumb: "Data" },
      },
      {
        path: 'queries', component: EmptyRouteComponent, children: [
          {
            path: 'import',
            component: DialogEntryComponent,
            data: { dialog: importQueryDialog, title: 'Import Query' }
          },
          {
            matcher: edit,
            loadChildren: () => import('../edit/edit.module').then(m => m.EditModule),
            data: { title: 'Edit Query Name and Description', history: false },
          },
          ...GoToMetadata.getRoutes(),
          { ...GoToPermissions.route, data: { title: 'Query Permissions' } },
          GoToDevRest.route,
        ],
        data: { title: 'App Queries' , breadcrumb: "Queries" },
      },
      {
        path: 'views', component: EmptyRouteComponent, children: [
          {
            path: 'import',
            component: DialogEntryComponent,
            data: { dialog: importViewDialog, title: 'Import View' },
          },
          { path: 'usage/:guid', component: DialogEntryComponent, data: { dialog: viewsUsageDialog } },
          {
            matcher: edit,
            loadChildren: () => import('../edit/edit.module').then(m => m.EditModule),
            data: { title: 'Edit View' },
          },
          {
            matcher: refreshEdit,
            loadChildren: () => import('../edit/refresh-edit.module').then(m => m.RefreshEditModule)
          },
          { ...GoToPermissions.route, data: { title: 'View Permissions' } },
          ...GoToMetadata.getRoutes(),
        ],
        data: { title: 'App Views', breadcrumb: "Views" },
      },
      {
        path: 'web-api', component: EmptyRouteComponent, data: { title: 'App WebApi', breadcrumb: "WebApi"  }, children: [
          GoToDevRest.route,
        ],
      },
      {
        path: 'app', component: EmptyRouteComponent, data: { title: 'Manage App', breadcrumb: "Manage App" }, children: [
          ...GoToMetadata.getRoutes(),
          {
            matcher: edit,
            loadChildren: () => import('../edit/edit.module').then(m => m.EditModule),
            data: { title: 'Edit App Properties' },
          },
          {
            matcher: refreshEdit,
            loadChildren: () => import('../edit/refresh-edit.module').then(m => m.RefreshEditModule)
          },
          {
            path: 'fields/:contentTypeStaticName',
            loadChildren: () => import('../content-type-fields/content-type-fields.module').then(m => m.ContentTypeFieldsModule),
            data: { title: 'Edit Fields of App Settings & Resources' },
          },
          {
            path: 'language-permissions', component: DialogEntryComponent, data: { dialog: languagePermissionsDialog, title: 'Language Permissions' }, children: [
              { ...GoToPermissions.route, data: { title: 'Language Permissions' } },
            ],
          },
          { ...GoToPermissions.route, data: { title: 'App Permissions' } },
          {
            path: 'analyze/:part', component: DialogEntryComponent, data: { dialog: analyzeSettingsDialog, title: 'Analyze Settings / Resources' }, children: [
              {
                path: 'details/:view/:settingsItemKey',
                component: DialogEntryComponent,
                data: { dialog: settingsItemDetailsDialog, title: 'Settings / Resources Item Details' },
              },
            ],
          },
        ],
      },
      {
        path: 'sync', component: EmptyRouteComponent, data: { title: 'Sync', breadcrumb:"Sync" }, children: [
          ...GoToMetadata.getRoutes(),
          { path: 'export', component: DialogEntryComponent, data: { dialog: exportAppDialog, title: 'Export App' } },
          { path: 'export/parts', component: DialogEntryComponent, data: { dialog: exportAppPartsDialog, title: 'Export App Parts' } },
          { path: 'import/parts', component: DialogEntryComponent, data: { dialog: importAppPartsDialog, title: 'Import App Parts' } },
        ],
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(appAdministrationRoutes)],
  exports: [RouterModule]
})
export class AppAdministrationRoutingModule { }
