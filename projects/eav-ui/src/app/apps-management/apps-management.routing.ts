import { Routes } from '@angular/router';
import { EditRoutesUnderAppsList } from '../edit/edit.routing';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { addAppFromFolderDialog } from './add-app-from-folder/add-app-from-folder-dialog.config';
import { appsManagementDialog } from './apps-management-nav/apps-management-dialog.config';
import { createAppDialog } from './create-app/create-app-dialog.config';
import { createInheritedAppDialog } from './create-inherited-app/create-inherited-app-dialog.config';

export const appsManagementRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: appsManagementDialog },
    children: [
      { path: '', redirectTo: 'system', pathMatch: 'full' },
      {
        path: 'system',
        loadComponent: () => import('./system-info/system-info.component').then(m => m.SystemInfoComponent),
        data: { title: 'System Info', breadcrumb: 'System Info' },
      },
      {
        path: 'registration',
        loadComponent: () => import('./sub-dialogs/registration/registration.component').then(m => m.RegistrationComponent),
        data: {
          title: 'Registration', breadcrumb: 'Register'
        }
      },
      {
        path: 'list',
        loadComponent: () => import('./apps-list/apps-list.component').then(m => m.AppsListComponent),
        children: [
          {
            path: 'import',
            loadChildren: () => import('../import-app/import-app.routing').then(m => m.importRoutes)
          },
          {
            path: 'create',
            component: DialogEntryComponent,
            data: { dialog: createAppDialog }
          },
          {
            path: 'create-inherited',
            component: DialogEntryComponent,
            data: { dialog: createInheritedAppDialog }
          },
          {
            path: 'add-app-from-folder',
            component: DialogEntryComponent,
            data: { dialog: addAppFromFolderDialog }
          },
          {
            path: ':appId',
            loadChildren: () => import('../app-administration/app-administration.routing').then(m => m.appAdministrationRoutes)
          },
          //...EditRoutesRoot,
          ...EditRoutesUnderAppsList,
        ],
        data: { title: 'Apps in this Zone', breadcrumb: 'Apps' },
      },
      {
        path: 'languages',
        loadComponent: () => import('./site-languages/site-languages.component').then(m => m.SiteLanguagesComponent),
        data: { title: 'Zone Languages', breadcrumb: 'Languages' }
      },
      {
        path: 'license',
        loadComponent: () => import('./licence-info/license-info.component').then(m => m.LicenseInfoComponent),
        data: { title: 'Extensions / Features', breadcrumb: 'Extensions and Features' },
      },
    ],
  },
];
