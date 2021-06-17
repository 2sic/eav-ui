import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { appsManagementDialog } from './apps-management-nav/apps-management-dialog.config';

const appsManagementRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: appsManagementDialog }, children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list', component: EmptyRouteComponent, children: [
          {
            path: 'import',
            loadChildren: () => import('../import-app/import-app.module').then(m => m.ImportAppModule)
          },
        ],
        data: { title: 'Apps in this Zone' },
      },
      {
        path: 'settings', component: EmptyRouteComponent, children: [
          {
            path: ':appId',
            loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
          },
          {
            path: ':zoneId/:appId',
            loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
          },
        ],
        data: { title: 'System Settings' },
      },
      { path: 'languages', component: EmptyRouteComponent, data: { title: 'Zone Languages' } },
      { path: 'features', component: EmptyRouteComponent, data: { title: 'Zone Features' } },
      { path: 'sxc-insights', component: EmptyRouteComponent, data: { title: 'Debug Insights' } },
      {
        path: ':appId',
        loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(appsManagementRoutes)],
  exports: [RouterModule]
})
export class AppsManagementRoutingModule { }
