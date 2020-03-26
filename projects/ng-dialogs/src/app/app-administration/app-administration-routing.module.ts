import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
// tslint:disable-next-line:max-line-length
import { APP_ADMINISTRATION_DIALOG, EDIT_CONTENT_TYPE_DIALOG, CONTENT_TYPE_FIELDS_DIALOG, EXPORT_CONTENT_TYPE_DIALOG, IMPORT_CONTENT_TYPE_DIALOG, SET_PERMISSIONS_DIALOG, EDIT_CONTENT_TYPE_FIELDS_DIALOG, IMPORT_QUERY_DIALOG, CONTENT_ITEMS_DIALOG, IMPORT_CONTENT_ITEM_DIALOG, EXPORT_APP, EXPORT_APP_PARTS, IMPORT_APP_PARTS } from '../shared/constants/dialog-names';
import { edit } from '../../../../edit/edit.matcher';
import { permissionsDialogConfig } from './shared/modals/permissions/permissions-dialog.config';
import { appAdministrationDialogConfig } from './app-administration-nav/app-administration-dialog.config';
import { contentItemsDialogConfig } from './shared/modals/content-items/content-items-dialog.config';
import { contentItemImportDialogConfig } from './shared/modals/content-item-import/content-item-import-dialog.config';
import { editContentTypeDialogConfig } from './shared/modals/edit-content-type/edit-content-type-dialog.config';
import { editContentTypeFieldsDialogConfig } from './shared/modals/edit-content-type-fields/edit-content-type-fields-dialog.config';
import { contentTypeFieldsDialogConfig } from './shared/modals/content-type-fields/content-type-fields-dialog.config';
import { contentExportDialogConfig } from './shared/modals/content-export/content-export-dialog.config';
import { contentImportDialogConfig } from './shared/modals/content-import/content-import-dialog.config';
import { importQueryDialogConfig } from './shared/modals/import-query/import-query-dialog.config';
import { exportAppDialogConfig } from './shared/modals/export-app/export-app-dialog.config';
import { exportAppPartsDialogConfig } from './shared/modals/export-app-parts/export-app-parts-dialog.config';
import { importAppPartsDialogConfig } from './shared/modals/import-app-parts/import-app-parts-dialog.config';

const appAdministrationRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: APP_ADMINISTRATION_DIALOG, dialogConfig: appAdministrationDialogConfig
    }, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: EmptyRouteComponent },
      {
        path: 'data', component: EmptyRouteComponent, children: [
          {
            path: ':contentTypeStaticName/items', component: DialogEntryComponent, data: {
              dialogName: CONTENT_ITEMS_DIALOG, dialogConfig: contentItemsDialogConfig
            }, children: [
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
              {
                path: ':contentTypeStaticName/export', component: DialogEntryComponent, data: {
                  dialogName: EXPORT_CONTENT_TYPE_DIALOG, dialogConfig: contentExportDialogConfig
                }
              },
              // tslint:disable-next-line:max-line-length
              {
                path: ':contentTypeStaticName/export/:selectedIds', component: DialogEntryComponent, data: {
                  dialogName: EXPORT_CONTENT_TYPE_DIALOG, dialogConfig: contentExportDialogConfig
                }
              },
              {
                path: 'import', component: DialogEntryComponent, data: {
                  dialogName: IMPORT_CONTENT_ITEM_DIALOG, dialogConfig: contentItemImportDialogConfig
                }
              },
            ]
          },
          {
            matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
            loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
          },
          {
            path: ':scope/add', component: DialogEntryComponent, data: {
              dialogName: EDIT_CONTENT_TYPE_DIALOG, dialogConfig: editContentTypeDialogConfig
            }
          },
          {
            path: ':scope/:id/edit', component: DialogEntryComponent, data: {
              dialogName: EDIT_CONTENT_TYPE_DIALOG, dialogConfig: editContentTypeDialogConfig
            }
          },
          {
            path: ':contentTypeStaticName/fields', component: DialogEntryComponent, data: {
              dialogName: CONTENT_TYPE_FIELDS_DIALOG, dialogConfig: contentTypeFieldsDialogConfig
            },
            children: [
              {
                path: 'add', component: DialogEntryComponent, data: {
                  dialogName: EDIT_CONTENT_TYPE_FIELDS_DIALOG, dialogConfig: editContentTypeFieldsDialogConfig
                }
              },
              {
                path: 'update/:id', component: DialogEntryComponent, data: {
                  dialogName: EDIT_CONTENT_TYPE_FIELDS_DIALOG, dialogConfig: editContentTypeFieldsDialogConfig
                }
              },
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
              {
                path: ':type/:keyType/:key/permissions', component: DialogEntryComponent, data: {
                  dialogName: SET_PERMISSIONS_DIALOG, dialogConfig: permissionsDialogConfig
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
            path: ':contentTypeStaticName/export', component: DialogEntryComponent, data: {
              dialogName: EXPORT_CONTENT_TYPE_DIALOG, dialogConfig: contentExportDialogConfig
            }
          },
          {
            path: ':contentTypeStaticName/import', component: DialogEntryComponent, data: {
              dialogName: IMPORT_CONTENT_TYPE_DIALOG, dialogConfig: contentImportDialogConfig
            }
          },
          {
            path: ':type/:keyType/:key/permissions', component: DialogEntryComponent, data: {
              dialogName: SET_PERMISSIONS_DIALOG, dialogConfig: permissionsDialogConfig
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
          {
            path: 'import', component: DialogEntryComponent, data: {
              dialogName: IMPORT_QUERY_DIALOG, dialogConfig: importQueryDialogConfig
            }
          },
          {
            matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
            loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
          },
          {
            path: ':type/:keyType/:key/permissions', component: DialogEntryComponent, data: {
              dialogName: SET_PERMISSIONS_DIALOG, dialogConfig: permissionsDialogConfig
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
              dialogName: SET_PERMISSIONS_DIALOG, dialogConfig: permissionsDialogConfig
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
            path: ':contentTypeStaticName/fields', component: DialogEntryComponent, data: {
              dialogName: CONTENT_TYPE_FIELDS_DIALOG, dialogConfig: contentTypeFieldsDialogConfig
            },
            children: [
              {
                path: 'add', component: DialogEntryComponent, data: {
                  dialogName: EDIT_CONTENT_TYPE_FIELDS_DIALOG, dialogConfig: editContentTypeFieldsDialogConfig
                }
              },
              {
                path: 'update/:id', component: DialogEntryComponent, data: {
                  dialogName: EDIT_CONTENT_TYPE_FIELDS_DIALOG, dialogConfig: editContentTypeFieldsDialogConfig
                }
              },
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
              {
                path: ':type/:keyType/:key/permissions', component: DialogEntryComponent, data: {
                  dialogName: SET_PERMISSIONS_DIALOG, dialogConfig: permissionsDialogConfig
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
              dialogName: SET_PERMISSIONS_DIALOG, dialogConfig: permissionsDialogConfig
            }, children: [
              {
                matcher: edit, // 'edit/:items' or 'edit/:items/details/:expandedFieldId'
                loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
              },
            ]
          },
          {
            path: 'export', component: DialogEntryComponent, data: {
              dialogName: EXPORT_APP, dialogConfig: exportAppDialogConfig
            }
          },
          {
            path: 'export/parts', component: DialogEntryComponent, data: {
              dialogName: EXPORT_APP_PARTS, dialogConfig: exportAppPartsDialogConfig
            }
          },
          {
            path: 'import/parts', component: DialogEntryComponent, data: {
              dialogName: IMPORT_APP_PARTS, dialogConfig: importAppPartsDialogConfig
            }
          },
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
