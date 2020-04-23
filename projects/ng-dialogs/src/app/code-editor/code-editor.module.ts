import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { AceModule } from 'ngx-ace-wrapper';

import { CodeEditorRoutingModule } from './code-editor-routing.module';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { CodeEditorComponent } from './code-editor.component';
import { Context } from '../shared/services/context';
import { SourceService } from './services/source.service';
import { DialogService } from '../shared/services/dialog.service';
import { CodeSnippetsComponent } from './code-snippets/code-snippets.component';

@NgModule({
  declarations: [
    CodeEditorComponent,
    CodeSnippetsComponent,
  ],
  entryComponents: [
    CodeEditorComponent,
    CodeSnippetsComponent,
  ],
  imports: [
    CodeEditorRoutingModule,
    SharedComponentsModule,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    AceModule,
    FormsModule,
    MatSelectModule,
  ],
  providers: [
    Context,
    SourceService,
    DialogService,
  ]
})
export class CodeEditorModule { }
