import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppsManagementEntryComponent } from './apps-management-entry/apps-management-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { ImportAppEntryComponent } from './shared/modals/import-app-entry/import-app-entry.component';

const appsManagementRoutes: Routes = [
  {
    path: '', component: AppsManagementEntryComponent, children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list', component: EmptyRouteComponent, children: [
          { path: 'import', component: ImportAppEntryComponent },
        ]
      },
      { path: 'settings', component: EmptyRouteComponent },
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
