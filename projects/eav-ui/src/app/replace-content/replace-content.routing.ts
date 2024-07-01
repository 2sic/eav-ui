import { Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { replaceContentDialog } from './replace-content-dialog.config';
import { EditRoutesSubItemsNoHistory } from '../edit/edit.routing';

export const replaceContentRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: replaceContentDialog },
    children: [
      // Note 2024-07-01 2dm - not sure why it is configured without history, but to be safe I'll keep it for now
      ...EditRoutesSubItemsNoHistory
    ],
  },
];
