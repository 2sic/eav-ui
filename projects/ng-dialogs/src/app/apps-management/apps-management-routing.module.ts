import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppsManagementEntryComponent } from './apps-management-entry/apps-management-entry.component';

const appsManagementRoutes: Routes = [
  {
    path: '', component: AppsManagementEntryComponent, children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list' },
      { path: 'settings' },
      { path: 'features' },
      { path: 'sxc-insights' },
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
