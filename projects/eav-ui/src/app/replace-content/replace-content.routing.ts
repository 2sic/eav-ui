import { Routes } from '@angular/router';
import { EditRoutesNoHistory } from '../edit/edit.routing';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry';
import { replaceContentDialog } from './replace-content-dialog.config';

export const replaceContentRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: replaceContentDialog },
    children: [
      // Note 2024-07-01 2dm - not sure why it is configured without history, but to be safe I'll keep it for now
      ...EditRoutesNoHistory
    ],
  },
];
