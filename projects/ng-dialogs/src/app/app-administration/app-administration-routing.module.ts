import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
// tslint:disable-next-line:max-line-length
import { APP_ADMINISTRATION_DIALOG, ADD_CONTENT_TYPE_DIALOG, EDIT_CONTENT_TYPE_DIALOG, EDIT_FIELDS_DIALOG, EXPORT_CONTENT_TYPE_DIALOG, IMPORT_CONTENT_TYPE_DIALOG, SET_PERMISSIONS_DIALOG, CONTENT_TYPES_FIELDS_ADD_DIALOG } from '../shared/constants/dialog-names';

const appAdministrationRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialogName: APP_ADMINISTRATION_DIALOG }, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: EmptyRouteComponent },
      {
        path: 'data', component: EmptyRouteComponent, children: [
          {
            path: 'edit',
            loadChildren: () => import('../../../../edit/app.module').then(m => m.EditModule)
          },
          { path: ':scope/add', component: DialogEntryComponent, data: { dialogName: ADD_CONTENT_TYPE_DIALOG } },
          { path: ':scope/:id/edit', component: DialogEntryComponent, data: { dialogName: EDIT_CONTENT_TYPE_DIALOG } },
          {
            path: ':contentTypeStaticName/fields', component: DialogEntryComponent, data: { dialogName: EDIT_FIELDS_DIALOG }, children: [
              {
                path: 'add', component: DialogEntryComponent, data: {
                  dialogName: CONTENT_TYPES_FIELDS_ADD_DIALOG
                }
              }
            ]
          },
          { path: ':contentTypeStaticName/export', component: DialogEntryComponent, data: { dialogName: EXPORT_CONTENT_TYPE_DIALOG } },
          { path: ':contentTypeStaticName/import', component: DialogEntryComponent, data: { dialogName: IMPORT_CONTENT_TYPE_DIALOG } },
          {
            path: ':contentTypeStaticName/:type/:keyType/permissions', component: DialogEntryComponent, data: {
              dialogName: SET_PERMISSIONS_DIALOG
            }, children: [
              {
                path: 'edit',
                loadChildren: () => import('../../../../edit/app.module').then(m => m.EditModule)
              },
            ]
          },
        ]
      },
      {
        path: 'queries', component: EmptyRouteComponent, children: [
          {
            path: 'edit',
            loadChildren: () => import('../../../../edit/app.module').then(m => m.EditModule)
          },
        ]
      },
      {
        path: 'views', component: EmptyRouteComponent, children: [
          {
            path: 'edit',
            loadChildren: () => import('../../../../edit/app.module').then(m => m.EditModule)
          },
          {
            path: ':contentTypeStaticName/:type/:keyType/permissions', component: DialogEntryComponent, data: {
              dialogName: SET_PERMISSIONS_DIALOG
            }, children: [
              {
                path: 'edit',
                loadChildren: () => import('../../../../edit/app.module').then(m => m.EditModule)
              },
            ]
          },
        ]
      },
      { path: 'web-api', component: EmptyRouteComponent },
      { path: 'app', component: EmptyRouteComponent },
      { path: 'global', component: EmptyRouteComponent },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(appAdministrationRoutes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppAdministrationRoutingModule { }
