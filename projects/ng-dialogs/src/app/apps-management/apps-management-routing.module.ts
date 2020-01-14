import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { APPS_MANAGEMENT_DIALOG, IMPORT_APP_DIALOG, ENABLE_LANGUAGES_DIALOG } from '../shared/constants/navigation-messages';

const appsManagementRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialogType: APPS_MANAGEMENT_DIALOG }, children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list', component: EmptyRouteComponent, children: [
          { path: 'import', component: DialogEntryComponent, data: { dialogType: IMPORT_APP_DIALOG } },
        ]
      },
      {
        path: 'settings', component: EmptyRouteComponent, children: [
          { path: 'languages', component: DialogEntryComponent, data: { dialogType: ENABLE_LANGUAGES_DIALOG } },
        ]
      },
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
