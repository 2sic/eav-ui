import { Routes } from '@angular/router';
import { GoToDevRest } from '../dev-rest';
import { EditRoutes, EditRoutesNoHistory } from '../edit/edit.routing';
import { featureInfoDialog } from '../features/feature-info-dialog/feature-info-dialog.config';
import { FeatureNames } from '../features/feature-names';
import { GoToMetadata } from '../metadata';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { appAdminDialog } from './app-admin-main/app-admin-dialog';
import { basicMessageDialog } from './app-configuration/message/basic-message-dialog';
import { CopilotSpecs } from './copilot/copilot-specs';
import { GoToCopilot } from './copilot/go-to-copilot';
import { AppStateComponent } from './import-export-menu/app-state/app-state';
import { DataBundlesComponent } from './import-export-menu/data-bundles/data-bundles';
import { dataBundlesDialog } from './import-export-menu/data-bundles/data-bundles-detail/data-bundles-dialog.config';
import { ExportAppPartsComponent } from './import-export-menu/export-app-parts/export-app-parts';
import { ExportAppComponent } from './import-export-menu/export-app/export-app';
import { ImportAppPartsComponent } from './import-export-menu/import-app-parts/import-app-parts';
import { ImportExportComponent } from './import-export-menu/import-export/import-export';
import { analyzeSettingsDialog } from './sub-dialogs/analyze-settings/analyze-settings-dialog.config';
import { settingsItemDetailsDialog } from './sub-dialogs/analyze-settings/settings-item-details/settings-item-details.config';
import { deleteExtensionDialog } from './sub-dialogs/delete-extension/delete-extension-dialog.config';
import { editContentTypeDialog } from './sub-dialogs/edit-content-type/edit-content-type-dialog.config';
import { importContentTypeDialog } from './sub-dialogs/import-content-type/import-content-type-dialog.config';
import { importDataBundlesDialog } from './sub-dialogs/import-data-bundles/import-data-bundles-dialog.config';
import { importExtensionDialog } from './sub-dialogs/import-extension/import-extension-dialog.config';
import { importQueryDialog } from './sub-dialogs/import-query/import-query-dialog.config';
import { importViewDialog } from './sub-dialogs/import-view/import-view-dialog.config';
import { inspectExtensionDialog } from './sub-dialogs/inspect-extension/inspect-extension-dialog.config';
import { languagePermissionsDialog } from './sub-dialogs/language-permissions/language-permissions-dialog.config';
import { viewsUsageDialog } from './sub-dialogs/views-usage/views-usage-dialog.config';

export const appAdministrationRoutes: Routes = [
  {
    path: '',
    // experimental 2dm
    // ...DialogEntryComponent.routeFor(appAdministrationDialog),
    component: DialogEntryComponent,
    data: { dialog: appAdminDialog },
    children: [
      {
        path: '', redirectTo: 'home', pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./getting-started/getting-started')
          .then(mod => mod.GettingStartedComponent),
        data: { title: 'App Home', breadcrumb: 'Info', }
      },
      {
        path: 'data/:scope',
        loadComponent: () => import('./data/data')
          .then(mod => mod.DataComponent),
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
            loadChildren: () => import('../content-items/content-items.routing')
              .then(m => m.contentItemsRoutes)
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
            loadChildren: () => import('../content-type-fields/content-type-fields.routing')
              .then(m => m.contentTypeFieldsRoutes),
            data: { title: 'Content Type Fields' },
          },
          {
            path: 'export/:contentTypeStaticName',
            loadChildren: () => import('../content-export/content-export.routing')
              .then(m => m.ContentExportRoutes),
            data: { title: 'Export Items' },
          },
          {
            path: ':contentTypeStaticName/import',
            loadChildren: () => import('../content-import/content-import.routing')
              .then(m => m.contentImportRoutes),
            data: { title: 'Import Items' },
          },
          GoToPermissions.route,
        ],
        data: { title: 'App Data', breadcrumb: "Data" },
      },
      {
        // Data Copilot
        path: `data-${GoToCopilot.route}`,
        loadComponent: () => import('./copilot/page/copilot-page.component')
          .then(mod => mod.CopilotPageComponent),
        data: CopilotSpecs.data,
        children: [
          ...EditRoutes,
        ]
      },
      {
        path: GoToDevRest.routeData,
        loadComponent: () => import('./data-rest-api/data-rest-api')
          .then(mod => mod.DataRestApiComponent),
        data: {
          title: 'Rest-Api Data',
          breadcrumb: 'Rest-Api Data'
        },
        children: [
          {
            path: `:${GoToDevRest.paramTypeName}`,
            loadComponent: () => import('../dev-rest/data/data')
              .then(mod => mod.DevRestDataComponent),
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
        loadComponent: () => import('./queries/queries')
          .then(mod => mod.QueriesComponent),
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
        loadComponent: () => import('./queries-rest-api/queries-rest-api')
          .then(mod => mod.QueriesRestApiComponent),
        data: { title: 'Rest-Api Queries', breadcrumb: 'Rest-Api Queries' },
        children: [
          {
            path: `:${GoToDevRest.paramQuery}`,
            loadComponent: () => import('../dev-rest/query/query.component')
              .then(mod => mod.DevRestQueryComponent),
            data: { breadcrumb: 'Rest-Api Queries', },
            children: [
              GoToPermissions.route,
            ]
          },
        ]
      },
      {
        path: 'views',
        loadComponent: () => import('./views/views.component')
          .then(mod => mod.ViewsComponent),
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
          {
            ...GoToPermissions.route, data: { title: 'View Permissions' }
          },
          ...GoToMetadata.getRoutes(),
        ],
        data: { title: 'App Views', breadcrumb: "Views" },
      },
      {
        // Views Copilot
        path: `views-${GoToCopilot.route}`,
        loadComponent: () => import('./copilot/page/copilot-page.component')
          .then(mod => mod.CopilotPageComponent),
        data: CopilotSpecs.views,
        children: [
          ...EditRoutes,
        ]
      },
      {
        path: 'extensions',
        loadComponent: () => import('./app-extensions/app-extensions')
          .then(mod => mod.AppExtensions),
        data: { title: 'App Extensions', breadcrumb: "App Extensions" },
        children: [
          ...EditRoutes,
          {
            path: 'import',
            component: DialogEntryComponent,
            data: { dialog: importExtensionDialog, title: 'Import Extension' },
          },
          {
            path: 'delete/:extension',
            component: DialogEntryComponent,
            data: { dialog: deleteExtensionDialog },
          },
          {
            path: 'inspect/:extension',
            component: DialogEntryComponent,
            data: { dialog: inspectExtensionDialog },
          },
        ]
      },
      {
        path: 'web-api',
        loadComponent: () => import('./web-api/web-api.component')
          .then(mod => mod.WebApiComponent),
        data: { title: 'App WebApi', breadcrumb: "WebApi" },
        children: [
          GoToDevRest.route,
        ],
      },
      {
        // WebAPI Copilot
        path: `web-api-${GoToCopilot.route}`,
        loadComponent: () => import('./copilot/page/copilot-page.component')
          .then(mod => mod.CopilotPageComponent),
        data: CopilotSpecs.webApi,
        children: [
          ...EditRoutes,
        ]
      },
      {
        path: GoToDevRest.routeWebApi,
        loadComponent: () => import('./web-api-rest-api/web-api-rest-api.component')
          .then(mod => mod.WebApiRestApiComponent),
        data: {
          title: 'Rest-Api Web Api',
          breadcrumb: 'Rest-Api Web Api'
        },
        children: [
          {
            path: `:${GoToDevRest.paramApiPath}`,
            loadComponent: () => import('../dev-rest/api/api')
              .then(mod => mod.DevRestApiComponent),
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
        loadComponent: () => import('./app-configuration/app-configuration')
          .then(mod => mod.AppConfiguration),
        data: { title: 'Manage App', breadcrumb: "Manage App" },
        children: [
          ...GoToMetadata.getRoutes(),
          // Edit App Properties / Settings / Resources
          ...EditRoutes,
          {
            path: 'fields/:contentTypeStaticName',
            loadChildren: () => import('../content-type-fields/content-type-fields.routing')
              .then(m => m.contentTypeFieldsRoutes),
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
          {
            path: 'edit-language-permissions',
            component: DialogEntryComponent,
            data: { dialog: featureInfoDialog, featureId: FeatureNames.PermissionsByLanguage },
            children: [
              { ...GoToPermissions.route },
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
            path: 'message/:type',
            component: DialogEntryComponent,
            data: { dialog: basicMessageDialog, i18n: 'An unexpected error happened.', errComponent: 'not found' },
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
            path: 'details/:guid/:name',
            component: DialogEntryComponent,
            data: { dialog: dataBundlesDialog, title: 'Data Bundles Details' },
          },
          {
            path: 'import',
            component: DialogEntryComponent,
            data: { dialog: importDataBundlesDialog, title: 'Import Data Bundle' },
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