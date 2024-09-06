import { Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { metadataDialog } from './metadata-dialog.config';
import { EditRoutes } from '../edit/edit.routing';

export const metadataRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: metadataDialog },
    children: EditRoutes
  },
];

