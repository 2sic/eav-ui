import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { APPS_MANAGEMENT_DIALOG, IMPORT_APP_DIALOG } from '../shared/constants/dialog-names';
import { appsManagementDialogConfig } from './apps-management-nav/apps-management-dialog.config';
import { importAppDialogConfig } from './shared/modals/import-app/import-app-dialog.config';

const appsManagementRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: APPS_MANAGEMENT_DIALOG, dialogConfig: appsManagementDialogConfig
    }, children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list', component: EmptyRouteComponent, children: [
          {
            path: 'import', component: DialogEntryComponent, data: {
              dialogName: IMPORT_APP_DIALOG, dialogConfig: importAppDialogConfig
            }
          },
        ]
      },
      { path: 'languages', component: EmptyRouteComponent },
      { path: 'features', component: EmptyRouteComponent },
      { path: 'sxc-insights', component: EmptyRouteComponent },
      {
        path: ':appId',
        loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
      },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(appsManagementRoutes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppsManagementRoutingModule { }
