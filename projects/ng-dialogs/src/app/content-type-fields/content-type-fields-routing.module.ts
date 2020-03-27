import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { CONTENT_TYPE_FIELDS_DIALOG } from '../shared/constants/dialog-names';
import { contentTypeFieldsDialogConfig } from './content-type-fields-dialog.config';
import { edit } from '../../../../edit/edit.matcher';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: CONTENT_TYPE_FIELDS_DIALOG, dialogConfig: contentTypeFieldsDialogConfig
    }, children: [
      {
        path: 'add/:contentTypeStaticName',
        loadChildren: () => import('../edit-content-type-fields/edit-content-type-fields.module').then(m => m.EditContentTypeFieldsModule)
      },
      {
        path: 'update/:contentTypeStaticName/:id',
        loadChildren: () => import('../edit-content-type-fields/edit-content-type-fields.module').then(m => m.EditContentTypeFieldsModule)
      },
      {
        path: 'permissions/:type/:keyType/:key',
        loadChildren: () => import('../permissions/permissions.module').then(m => m.PermissionsModule)
      },
      {
        matcher: edit,
        loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentTypeFieldsRoutingModule { }
