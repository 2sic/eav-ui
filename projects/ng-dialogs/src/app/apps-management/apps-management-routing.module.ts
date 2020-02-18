import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { APPS_MANAGEMENT_DIALOG, IMPORT_APP_DIALOG } from '../shared/constants/dialog-names';

const appsManagementRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialogName: APPS_MANAGEMENT_DIALOG }, children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list', component: EmptyRouteComponent, children: [
          { path: 'import', component: DialogEntryComponent, data: { dialogName: IMPORT_APP_DIALOG } },
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
