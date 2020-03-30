import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { codeEditorDialog } from './code-editor-dialog.config';

const routes: Routes = [
  { path: '', component: DialogEntryComponent, data: { dialog: codeEditorDialog } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodeEditorRoutingModule { }
