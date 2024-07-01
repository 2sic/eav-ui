import { Routes } from '@angular/router';
import { GoToMetadata } from '../metadata';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { contentTypeFieldsDialog } from './content-type-fields-dialog.config';
import { editContentTypeFieldsDialog } from './edit-content-type-fields/edit-content-type-fields-dialog.config';
import { EditRoutesSubItems } from '../edit/edit.routing';

export const contentTypeFieldsRoutes: Routes = [
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
      ...EditRoutesSubItems,
    ]
  }
];

