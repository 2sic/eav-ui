import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

import { CodeEditorRoutingModule } from './code-editor-routing.module';
import { CodeEditorEntryComponent } from './code-editor-entry/code-editor-entry.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';

@NgModule({
  declarations: [
    CodeEditorEntryComponent,
    CodeEditorComponent,
  ],
  entryComponents: [
    CodeEditorEntryComponent,
    CodeEditorComponent,
  ],
  imports: [
    CommonModule,
    CodeEditorRoutingModule,
    MatDialogModule,
  ]
})
export class CodeEditorModule { }
