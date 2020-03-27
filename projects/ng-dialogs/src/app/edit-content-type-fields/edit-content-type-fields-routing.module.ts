import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EDIT_CONTENT_TYPE_FIELDS_DIALOG } from '../shared/constants/dialog-names';
import { editContentTypeFieldsDialogConfig } from './edit-content-type-fields-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: EDIT_CONTENT_TYPE_FIELDS_DIALOG, dialogConfig: editContentTypeFieldsDialogConfig
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditContentTypeFieldsRoutingModule { }
