import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CodeEditorRoutingModule } from './code-editor-routing.module';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { CodeEditorComponent } from './code-editor/code-editor.component';

@NgModule({
  declarations: [
    CodeEditorComponent,
  ],
  entryComponents: [
    CodeEditorComponent,
  ],
  imports: [
    CodeEditorRoutingModule,
    SharedComponentsModule,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class CodeEditorModule { }
