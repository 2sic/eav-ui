import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { CONTENT_TYPE_FIELDS_DIALOG, EDIT_CONTENT_TYPE_FIELDS_DIALOG, SET_PERMISSIONS_DIALOG } from '../shared/constants/dialog-names';
import { contentTypeFieldsDialogConfig } from './content-type-fields-dialog.config';
import { editContentTypeFieldsDialogConfig } from './edit-content-type-fields/edit-content-type-fields-dialog.config';
import { edit } from '../../../../edit/edit.matcher';
import { permissionsDialogConfig } from '../app-administration/shared/modals/permissions/permissions-dialog.config';

const routes: Routes = [
  {
    path: ':contentTypeStaticName', component: DialogEntryComponent, data: {
      dialogName: CONTENT_TYPE_FIELDS_DIALOG, dialogConfig: contentTypeFieldsDialogConfig
    }, children: [
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentItemsRoutingModule { }
