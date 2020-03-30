import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { CODE_EDITOR_DIALOG } from '../shared/constants/dialog-names';
import { codeEditorDialogConfig } from './code-editor-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: CODE_EDITOR_DIALOG, dialogConfig: codeEditorDialogConfig
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodeEditorRoutingModule { }
