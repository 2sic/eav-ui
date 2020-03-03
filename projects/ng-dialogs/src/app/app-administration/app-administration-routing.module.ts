import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
// tslint:disable-next-line:max-line-length
import { APP_ADMINISTRATION_DIALOG, EDIT_CONTENT_TYPE_DIALOG, CONTENT_TYPE_FIELDS_DIALOG, EXPORT_CONTENT_TYPE_DIALOG, IMPORT_CONTENT_TYPE_DIALOG, SET_PERMISSIONS_DIALOG, EDIT_CONTENT_TYPE_FIELDS_DIALOG, IMPORT_QUERY_DIALOG, CONTENT_ITEMS_DIALOG, IMPORT_CONTENT_ITEM_DIALOG, EXPORT_APP_ALL, EXPORT_APP_PARTS, IMPORT_APP_PARTS } from '../shared/constants/dialog-names';
import { edit } from '../../../../edit/edit.matcher';

const appAdministrationRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialogName: APP_ADMINISTRATION_DIALOG }, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: EmptyRouteComponent },
      {
        path: 'data', component: EmptyRouteComponent, children: [
          {
            path: ':contentTypeStaticName/items', component: DialogEntryComponent, data: { dialogName: CONTENT_ITEMS_DIALOG }, children: [
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
              { path: ':contentTypeStaticName/export', component: DialogEntryComponent, data: { dialogName: EXPORT_CONTENT_TYPE_DIALOG } },
              // tslint:disable-next-line:max-line-length
              { path: ':contentTypeStaticName/export/:selectedIds', component: DialogEntryComponent, data: { dialogName: EXPORT_CONTENT_TYPE_DIALOG } },
              { path: 'import', component: DialogEntryComponent, data: { dialogName: IMPORT_CONTENT_ITEM_DIALOG } },
            ]
          },
          {
            matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
            loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
          },
          { path: ':scope/add', component: DialogEntryComponent, data: { dialogName: EDIT_CONTENT_TYPE_DIALOG } },
          { path: ':scope/:id/edit', component: DialogEntryComponent, data: { dialogName: EDIT_CONTENT_TYPE_DIALOG } },
          {
            path: ':contentTypeStaticName/fields', component: DialogEntryComponent, data: { dialogName: CONTENT_TYPE_FIELDS_DIALOG },
            children: [
              { path: 'add', component: DialogEntryComponent, data: { dialogName: EDIT_CONTENT_TYPE_FIELDS_DIALOG } },
              { path: 'update/:id', component: DialogEntryComponent, data: { dialogName: EDIT_CONTENT_TYPE_FIELDS_DIALOG } },
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
              {
                path: ':type/:keyType/:key/permissions', component: DialogEntryComponent, data: {
                  dialogName: SET_PERMISSIONS_DIALOG
                }, children: [
                  {
                    matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                    loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
                  },
                ]
              },
            ]
          },
          { path: ':contentTypeStaticName/export', component: DialogEntryComponent, data: { dialogName: EXPORT_CONTENT_TYPE_DIALOG } },
          { path: ':contentTypeStaticName/import', component: DialogEntryComponent, data: { dialogName: IMPORT_CONTENT_TYPE_DIALOG } },
          {
            path: ':type/:keyType/:key/permissions', component: DialogEntryComponent, data: {
              dialogName: SET_PERMISSIONS_DIALOG
            }, children: [
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
            ]
          },
        ]
      },
      {
        path: 'queries', component: EmptyRouteComponent, children: [
          { path: 'import', component: DialogEntryComponent, data: { dialogName: IMPORT_QUERY_DIALOG } },
          {
            matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
            loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
          },
          {
            path: ':type/:keyType/:key/permissions', component: DialogEntryComponent, data: {
              dialogName: SET_PERMISSIONS_DIALOG
            }, children: [
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
            ]
          },
        ]
      },
      {
        path: 'views', component: EmptyRouteComponent, children: [
          {
            matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
            loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
          },
          {
            path: ':type/:keyType/:key/permissions', component: DialogEntryComponent, data: {
              dialogName: SET_PERMISSIONS_DIALOG
            }, children: [
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
            ]
          },
        ]
      },
      { path: 'web-api', component: EmptyRouteComponent },
      {
        path: 'app', component: EmptyRouteComponent, children: [
          {
            matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
            loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
          },
          {
            path: ':contentTypeStaticName/fields', component: DialogEntryComponent, data: { dialogName: CONTENT_TYPE_FIELDS_DIALOG },
            children: [
              { path: 'add', component: DialogEntryComponent, data: { dialogName: EDIT_CONTENT_TYPE_FIELDS_DIALOG } },
              { path: 'update/:id', component: DialogEntryComponent, data: { dialogName: EDIT_CONTENT_TYPE_FIELDS_DIALOG } },
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
              {
                path: ':type/:keyType/:key/permissions', component: DialogEntryComponent, data: {
                  dialogName: SET_PERMISSIONS_DIALOG
                }, children: [
                  {
                    matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                    loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
                  },
                ]
              },
            ]
          },
          {
            path: ':type/:keyType/:key/permissions', component: DialogEntryComponent, data: {
              dialogName: SET_PERMISSIONS_DIALOG
            }, children: [
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
            ]
          },
          { path: 'export/all', component: DialogEntryComponent, data: { dialogName: EXPORT_APP_ALL } },
          { path: 'export/parts', component: DialogEntryComponent, data: { dialogName: EXPORT_APP_PARTS } },
          { path: 'import/parts', component: DialogEntryComponent, data: { dialogName: IMPORT_APP_PARTS } },
        ]
      },
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
