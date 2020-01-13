import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CodeEditorEntryComponent } from './code-editor-entry/code-editor-entry.component';

const routes: Routes = [
  { path: '', component: CodeEditorEntryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodeEditorRoutingModule { }
