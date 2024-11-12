import { Routes } from '@angular/router';
import { GoToDevRest } from '../dev-rest';
import { EditRoutes, EditRoutesNoHistory } from '../edit/edit.routing';
import { GoToMetadata } from '../metadata';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { appAdministrationDialog } from './app-admin-main/app-admin-main.dialog-config';
import { errorDialog } from './app-configuration/error/error-dialog.config';
import { messageDialog } from './app-configuration/message/message-dialog.config';
import { CopilotSpecs } from './copilot/copilot-specs';
import { GoToCopilot } from './copilot/go-to-copilot';
import { AppStateComponent } from './import-export-menu/app-state/app-state.component';
import { dataBundlesDialog } from './import-export-menu/data-bundles/data-bundles-detail/data-bundles-dialog.config';
import { DataBundlesComponent } from './import-export-menu/data-bundles/data-bundles.component';
import { ExportAppPartsComponent } from './import-export-menu/export-app-parts/export-app-parts.component';
import { ExportAppComponent } from './import-export-menu/export-app/export-app.component';
import { ImportAppPartsComponent } from './import-export-menu/import-app-parts/import-app-parts.component';
import { ImportExportComponent } from './import-export-menu/import-export/import-export.component';
import { analyzeSettingsDialog } from './sub-dialogs/analyze-settings/analyze-settings-dialog.config';
import { settingsItemDetailsDialog } from './sub-dialogs/analyze-settings/settings-item-details/settings-item-details.config';
import { editContentTypeDialog } from './sub-dialogs/edit-content-type/edit-content-type-dialog.config';
import { importContentTypeDialog } from './sub-dialogs/import-content-type/import-content-type-dialog.config';
import { importQueryDialog } from './sub-dialogs/import-query/import-query-dialog.config';
import { importViewDialog } from './sub-dialogs/import-view/import-view-dialog.config';
import { languagePermissionsDialog } from './sub-dialogs/language-permissions/language-permissions-dialog.config';
import { viewsUsageDialog } from './sub-dialogs/views-usage/views-usage-dialog.config';

export const appAdministrationRoutes: Routes = [
  {
    path: '',
    // experimental 2dm
    // ...DialogEntryComponent.routeFor(appAdministrationDialog),
    component: DialogEntryComponent,
    data: { dialog: appAdministrationDialog },
    children: [
      {
        path: '', redirectTo: 'home', pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./getting-started/getting-started.component').then(mod => mod.GettingStartedComponent),
        data: { title: 'App Home', breadcrumb: 'Info', }
      },
      {
        path: 'data/:scope',
        loadComponent: () => import('./data/data.component').then(mod => mod.DataComponent),
        children: [
          {
            path: 'import',
            // experimental 2dm
            // ...DialogEntryComponent.routeFor(importContentTypeDialog, { title: 'Import Content Type' }),
            component: DialogEntryComponent,
            data: { dialog: importContentTypeDialog, title: 'Import Content Type' },
          },
          {
            path: 'items/:contentTypeStaticName',
            loadChildren: () => import('../content-items/content-items.routing').then(m => m.contentItemsRoutes)
          },
          ...EditRoutes,
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
            // May change how things are injected, so be careful when evaluating
            loadChildren: () => import('../content-type-fields/content-type-fields.routing').then(m => m.contentTypeFieldsRoutes),
            data: { title: 'Content Type Fields' },
          },
          {
            path: 'export/:contentTypeStaticName',
            loadChildren: () => import('../content-export/content-export.routing').then(m => m.ContentExportRoutes),
            data: { title: 'Export Items' },
          },
          {
            path: ':contentTypeStaticName/import',
            loadChildren: () => import('../content-import/content-import.routing').then(m => m.contentImportRoutes),
            data: { title: 'Import Items' },
          },
          GoToPermissions.route,
        ],
        data: { title: 'App Data', breadcrumb: "Data" },
      },
      {
        path: `data-${GoToCopilot.route}`,
        loadComponent: () => import('./copilot/page/copilot-page.component').then(mod => mod.CopilotPageComponent),
        data: CopilotSpecs.data,
      },
      {
        path: GoToDevRest.routeData,
        loadComponent: () => import('./data-rest-api/data-rest-api.component').then(mod => mod.DataRestApiComponent),
        data: {
          title: 'Rest-Api Data',
          breadcrumb: 'Rest-Api Data'
        },
        children: [
          {
            path: `:${GoToDevRest.paramTypeName}`,
            loadComponent: () => import('../dev-rest/data/data.component').then(mod => mod.DevRestDataComponent),
            data: {
              breadcrumb: 'Rest-Api Data'
            },
            children: [
              GoToPermissions.route,
            ]
          },
        ]
      },
      {
        path: 'queries',
        loadComponent: () => import('./queries/queries.component').then(mod => mod.QueriesComponent),
        children: [
          {
            path: 'import',
            component: DialogEntryComponent,
            data: { dialog: importQueryDialog, title: 'Import Query' }
          },
          ...EditRoutesNoHistory,
          ...GoToMetadata.getRoutes(),
          {
            ...GoToPermissions.route,
            data: { title: 'Query Permissions' }
          },
          GoToDevRest.route,
        ],
        data: { title: 'App Queries', breadcrumb: "Queries" },
      },
      {
        path: GoToDevRest.routeQuery,
        loadComponent: () => import('./queries-rest-api/queries-rest-api.component').then(mod => mod.QueriesRestApiComponent),
        data: { title: 'Rest-Api Queries', breadcrumb: 'Rest-Api Queries' },
        children: [
          {
            path: `:${GoToDevRest.paramQuery}`,
            loadComponent: () => import('../dev-rest/query/query.component').then(mod => mod.DevRestQueryComponent),
            data: { breadcrumb: 'Rest-Api Queries', },
            children: [
              GoToPermissions.route,
            ]
          },
        ]
      },
      {
        path: 'views',
        loadComponent: () => import('./views/views.component').then(mod => mod.ViewsComponent),
        children: [
          {
            path: 'import',
            component: DialogEntryComponent,
            data: { dialog: importViewDialog, title: 'Import View' },
          },
          {
            path: 'usage/:guid',
            component: DialogEntryComponent,
            data: { dialog: viewsUsageDialog }
          },
          ...EditRoutes,
          { ...GoToPermissions.route, data: { title: 'View Permissions' } },
          ...GoToMetadata.getRoutes(),
        ],
        data: { title: 'App Views', breadcrumb: "Views" },
      },
      {
        path: `views-${GoToCopilot.route}`,
        loadComponent: () => import('./copilot/page/copilot-page.component').then(mod => mod.CopilotPageComponent),
        data: CopilotSpecs.views,
      },
      {
        path: 'web-api',
        loadComponent: () => import('./web-api/web-api.component').then(mod => mod.WebApiComponent),
        data: { title: 'App WebApi', breadcrumb: "WebApi" },
        children: [
          GoToDevRest.route,
        ],
      },
      {
        path: `web-api-${GoToCopilot.route}`,
        loadComponent: () => import('./copilot/page/copilot-page.component').then(mod => mod.CopilotPageComponent),
        data: CopilotSpecs.webApi,
      },
      {
        path: GoToDevRest.routeWebApi,
        loadComponent: () => import('./web-api-rest-api/web-api-rest-api.component').then(mod => mod.WebApiRestApiComponent),
        data: {
          title: 'Rest-Api Web Api',
          breadcrumb: 'Rest-Api Web Api'
        },
        children: [
          {
            path: `:${GoToDevRest.paramApiPath}`,
            loadComponent: () => import('../dev-rest/api/api.component').then(mod => mod.DevRestApiComponent),
            data: {
              breadcrumb: 'Rest-Api Web Api'
            },
            children: [
              GoToPermissions.route,
            ]
          },
        ]
      },
      {
        path: 'app',
        loadComponent: () => import('./app-configuration/app-configuration.component').then(mod => mod.AppConfigurationComponent),
        data: { title: 'Manage App', breadcrumb: "Manage App" },
        children: [
          ...GoToMetadata.getRoutes(),
          // Edit App Properties / Settings / Resources
          ...EditRoutes,
          {
            path: 'fields/:contentTypeStaticName',
            loadChildren: () => import('../content-type-fields/content-type-fields.routing').then(m => m.contentTypeFieldsRoutes),
            data: { title: 'Edit Fields of App Settings & Resources' },
          },
          {
            path: 'language-permissions',
            component: DialogEntryComponent,
            data: { dialog: languagePermissionsDialog, title: 'Language Permissions' },
            children: [
              { ...GoToPermissions.route, data: { title: 'Language Permissions' } },
            ],
          },
          { ...GoToPermissions.route, data: { title: 'App Permissions' } },
          {
            path: 'analyze/:part',
            component: DialogEntryComponent,
            data: { dialog: analyzeSettingsDialog, title: 'Analyze Settings / Resources' }, children: [
              {
                path: 'details/:view/:settingsItemKey',
                component: DialogEntryComponent,
                data: { dialog: settingsItemDetailsDialog, title: 'Settings / Resources Item Details' },
              },
            ],
          },
          {
            path: 'message',
            children: [
              {
                path: 'e',
                component: DialogEntryComponent,
                data: { dialog: errorDialog, i18n: 'error' },
              },
              {
                path: 'm',
                component: DialogEntryComponent,
                data: { dialog: messageDialog, i18n: 'message' },
              },
            ],
          },
        ],
      },
      {
        path: 'import-export',
        component: ImportExportComponent,
        data: { breadcrumb: 'Import Export' },
      },
      {
        path: 'export-app',
        component: ExportAppComponent,
        data: { breadcrumb: 'Export this entire App' },
      },
      {
        path: 'data-bundles',
        component: DataBundlesComponent,
        data: { breadcrumb: 'Data Bundles' },
        children: [
          ...EditRoutes,
          {
            // TODO: @2dg - lessons learned: never place a name-string which could contain anything incl. "/" in the middle of the path, better never in any path
            // path: 'details/:name/:guid',
            path: 'details/:guid/:name',
            component: DialogEntryComponent,
            data: { dialog: dataBundlesDialog, title: 'Data Bundles Details' },
          },
        ]
      },
      {
        path: 'export-parts',
        component: ExportAppPartsComponent,
        data: { breadcrumb: 'Export parts of this App' },
      },
      {
        path: 'import-parts',
        component: ImportAppPartsComponent,
        data: { breadcrumb: 'Import parts of this App' },
      },
      {
        path: 'app-state',
        component: AppStateComponent,
        data: { breadcrumb: 'App-State Versioning' },
      },

    ]
  },
];
