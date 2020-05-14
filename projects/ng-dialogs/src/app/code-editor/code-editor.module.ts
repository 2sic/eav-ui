import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';

import { CodeEditorRoutingModule } from './code-editor-routing.module';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { CodeEditorComponent } from './code-editor.component';
import { Context } from '../shared/services/context';
import { SourceService } from './services/source.service';
import { DialogService } from '../shared/services/dialog.service';
import { CodeSnippetsComponent } from './code-snippets/code-snippets.component';
import { SnippetsService } from './services/snippets.service';
import { ToArrayPipe } from './code-snippets/toarray.pipe';
import { CodeTemplatesComponent } from './code-templates/code-templates.component';
import { AceEditorComponent } from './ace-editor/ace-editor.component';
import { SanitizeService } from '../../../../edit/eav-material-controls/adam/sanitize.service';
import { DepthPaddingPipe } from './code-templates/depth-padding.pipe';
import { SortItemsPipe } from './code-templates/order-items.pipe';

@NgModule({
  declarations: [
    CodeEditorComponent,
    CodeSnippetsComponent,
    ToArrayPipe,
    CodeTemplatesComponent,
    AceEditorComponent,
    DepthPaddingPipe,
    SortItemsPipe,
  ],
  entryComponents: [
    CodeEditorComponent,
    CodeSnippetsComponent,
    CodeTemplatesComponent,
    AceEditorComponent,
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
    FormsModule,
    MatSelectModule,
    MatRippleModule,
  ],
  providers: [
    Context,
    SourceService,
    DialogService,
    SnippetsService,
    SanitizeService,
  ]
})
export class CodeEditorModule { }
