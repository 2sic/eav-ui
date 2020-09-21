import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { edit } from '../../../../edit/edit.matcher';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { contentTypeFieldsDialog } from './content-type-fields-dialog.config';
import { editContentTypeFieldsDialog } from './edit-content-type-fields/edit-content-type-fields-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: contentTypeFieldsDialog }, children: [
      { path: 'add/:contentTypeStaticName', component: DialogEntryComponent, data: { dialog: editContentTypeFieldsDialog } },
      { path: 'update/:contentTypeStaticName/:id', component: DialogEntryComponent, data: { dialog: editContentTypeFieldsDialog } },
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
