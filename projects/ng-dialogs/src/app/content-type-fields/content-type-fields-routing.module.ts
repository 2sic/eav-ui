import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { CONTENT_TYPE_FIELDS_DIALOG } from '../shared/constants/dialog-names';
import { contentTypeFieldsDialogConfig } from './content-type-fields-dialog.config';

const routes: Routes = [
  {
    path: ':contentTypeStaticName', component: DialogEntryComponent, data: {
      dialogName: CONTENT_TYPE_FIELDS_DIALOG, dialogConfig: contentTypeFieldsDialogConfig
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentItemsRoutingModule { }
