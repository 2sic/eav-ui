import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { editRoot, refreshEditRoot } from '../edit/edit.matcher';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { addAppFromFolderDialog } from './add-app-from-folder/add-app-from-folder-dialog.config';
import { appsManagementDialog } from './apps-management-nav/apps-management-dialog.config';
import { createAppDialog } from './create-app/create-app-dialog.config';
import { createInheritedAppDialog } from './create-inherited-app/create-inherited-app-dialog.config';
import { GoToRegistration } from './sub-dialogs/registration/go-to-registration';

const appsManagementRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: appsManagementDialog }, children: [
      { path: '', redirectTo: 'system', pathMatch: 'full' },
      {
        path: 'system', component: EmptyRouteComponent, data: { title: 'System Info' }, children: [
          GoToRegistration.getRoute()
        ]
      },
      {
        path: 'list', component: EmptyRouteComponent, children: [
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
        data: { title: 'Apps in this Zone' },
      },
      { path: 'languages', component: EmptyRouteComponent, data: { title: 'Zone Languages' } },
      {
        path: 'license', component: EmptyRouteComponent, data: { title: 'Extensions / Features' }, children: [
          GoToRegistration.getRoute()
        ]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(appsManagementRoutes)],
  exports: [RouterModule]
})
export class AppsManagementRoutingModule { }
