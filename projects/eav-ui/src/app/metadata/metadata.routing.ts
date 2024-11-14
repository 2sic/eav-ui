import { Routes } from '@angular/router';
import { EditRoutes } from '../edit/edit.routing';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { metadataDialog } from './metadata-dialog.config';

export const metadataRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: metadataDialog },
    children: EditRoutes
  },
];
