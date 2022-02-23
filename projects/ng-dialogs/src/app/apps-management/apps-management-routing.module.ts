import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { appsManagementDialog } from './apps-management-nav/apps-management-dialog.config';
import { createAppDialog } from './create-app/create-app-dialog.config';
import { createInheritedAppDialog } from './create-inherited-app/create-inherited-app-dialog.config';

const appsManagementRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: appsManagementDialog }, children: [
      { path: '', redirectTo: 'system', pathMatch: 'full' },
      { path: 'system', component: EmptyRouteComponent, data: { title: 'System Info' } },
      {
        path: 'list', component: EmptyRouteComponent, children: [
          {
            path: 'import',
            loadChildren: () => import('../import-app/import-app.module').then(m => m.ImportAppModule)
          },
          { path: 'create', component: DialogEntryComponent, data: { dialog: createAppDialog } },
          { path: 'create-inherited', component: DialogEntryComponent, data: { dialog: createInheritedAppDialog } },
          {
            path: ':appId',
            loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
          },
        ],
        data: { title: 'Apps in this Zone' },
      },
      { path: 'languages', component: EmptyRouteComponent, data: { title: 'Zone Languages' } },
      { path: 'license', component: EmptyRouteComponent, data: { title: 'License Info' } },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(appsManagementRoutes)],
  exports: [RouterModule]
})
export class AppsManagementRoutingModule { }
