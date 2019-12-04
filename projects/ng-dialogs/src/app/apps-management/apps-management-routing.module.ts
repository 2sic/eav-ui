import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppsManagementEntryComponent } from './apps-management-entry/apps-management-entry.component';
import { AppsManagementTabPickerComponent } from './apps-management-tab-picker/apps-management-tab-picker.component';

const appsManagementRoutes: Routes = [
  {
    path: '', component: AppsManagementEntryComponent, children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: AppsManagementTabPickerComponent },
      { path: 'settings', component: AppsManagementTabPickerComponent },
      { path: 'features', component: AppsManagementTabPickerComponent },
      { path: 'sxc-insights', component: AppsManagementTabPickerComponent },
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
