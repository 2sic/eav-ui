import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { editRoot, refreshEditRoot } from '../edit/edit.matcher';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { addAppFromFolderDialog } from './add-app-from-folder/add-app-from-folder-dialog.config';
import { appsManagementDialog } from './apps-management-nav/apps-management-dialog.config';
import { createAppDialog } from './create-app/create-app-dialog.config';
import { createInheritedAppDialog } from './create-inherited-app/create-inherited-app-dialog.config';
import { SystemInfoComponent } from './system-info/system-info.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { SiteLanguagesComponent } from './site-languages/site-languages.component';
import { LicenseInfoComponent } from './licence-info/license-info.component';
import { RegistrationComponent } from './sub-dialogs/registration/registration.component';

const appsManagementRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: appsManagementDialog }, children: [
      { path: '', redirectTo: 'system', pathMatch: 'full' },
      {
        path: 'system', component: SystemInfoComponent, data: { title: 'System Info' , breadcrumb: 'System Info'},
        // @2dg is no longer needed as Register is a separate SideNav and no longer a dialog
        //  children: [
        //     GoToRegistration.getRoute()
        // ]
      },
      { path: 'registration', component: RegistrationComponent, data: {
          title: 'Registration', breadcrumb: 'Register'
        }
      },
      {
        path: 'list', component: AppsListComponent, children: [
          {
            path: 'import',
            loadChildren: () => import('../import-app/import-app.module').then(m => m.ImportAppModule)
          },
          { path: 'create', component: DialogEntryComponent, data: { dialog: createAppDialog } },
          { path: 'create-inherited', component: DialogEntryComponent, data: { dialog: createInheritedAppDialog } },
          { path: 'add-app-from-folder', component: DialogEntryComponent, data: { dialog: addAppFromFolderDialog } },
          {
            path: ':appId',
            loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
          },
          {
            matcher: editRoot,
            loadChildren: () => import('../edit/edit.module').then(m => m.EditModule),
          },
          {
            matcher: refreshEditRoot,
            loadChildren: () => import('../edit/refresh-edit.module').then(m => m.RefreshEditModule)
          },
        ],
        data: { title: 'Apps in this Zone' , breadcrumb: 'Apps' },
      },
      { path: 'languages', component: SiteLanguagesComponent, data: { title: 'Zone Languages' , breadcrumb: 'Languages' } },
      {
        path: 'license', component: LicenseInfoComponent, data: { title: 'Extensions / Features' , breadcrumb: 'Extensions and Features' },
         // @2dg is no longer needed as Register is a separate SideNav and no longer a dialog
        //  children: [
        //   GoToRegistration.getRoute()
        // ]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(appsManagementRoutes)],
  exports: [RouterModule]
})
export class AppsManagementRoutingModule { }
