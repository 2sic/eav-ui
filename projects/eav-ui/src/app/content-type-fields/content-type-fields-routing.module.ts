import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { edit, refreshEdit } from '../edit/edit.matcher';
import { GoToMetadata } from '../metadata';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { contentTypeFieldsDialog } from './content-type-fields-dialog.config';
import { editContentTypeFieldsDialog } from './edit-content-type-fields/edit-content-type-fields-dialog.config';

const routes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: contentTypeFieldsDialog },
    children: [
      {
        path: 'add/:contentTypeStaticName',
        component: DialogEntryComponent,
        data: { dialog: editContentTypeFieldsDialog }
      },
      {
        path: 'update/:contentTypeStaticName/:id/:editMode',
        component: DialogEntryComponent,
        data: { dialog: editContentTypeFieldsDialog },
      },
      ...GoToMetadata.getRoutes(),
      GoToPermissions.route,
      {
        matcher: edit,
        loadChildren: () => import('../edit/edit.module').then(m => m.EditModule)
      },
      {
        matcher: refreshEdit,
        loadChildren: () => import('../edit/refresh-edit.module').then(m => m.RefreshEditModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentTypeFieldsRoutingModule { }
