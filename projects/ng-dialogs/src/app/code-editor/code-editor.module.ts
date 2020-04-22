import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AceModule } from 'ngx-ace-wrapper';

import { CodeEditorRoutingModule } from './code-editor-routing.module';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { CodeEditorComponent } from './code-editor.component';
import { Context } from '../shared/services/context';
import { SourceService } from './services/source.service';

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
    MatTooltipModule,
    MatSnackBarModule,
    AceModule,
  ],
  providers: [
    Context,
    SourceService,
  ]
})
export class CodeEditorModule { }
