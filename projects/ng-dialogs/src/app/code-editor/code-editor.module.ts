import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MonacoEditorModule } from '../monaco-editor';
import { EavWindow } from '../shared/models/eav-window.model';
import { Context } from '../shared/services/context';
import { DialogService } from '../shared/services/dialog.service';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { buildTranslateConfiguration, TranslateLoaderWithErrorHandling } from '../shared/translation';
import { AceEditorComponent } from './ace-editor/ace-editor.component';
import { CodeEditorRoutingModule } from './code-editor-routing.module';
import { CodeEditorComponent } from './code-editor.component';
import { CodeSnippetsComponent } from './code-snippets/code-snippets.component';
import { ObjectToArrayPipe } from './code-snippets/object-to-array.pipe';
import { CodeTemplatesComponent } from './code-templates/code-templates.component';
import { DepthPaddingPipe } from './code-templates/depth-padding.pipe';
import { SortItemsPipe } from './code-templates/order-items.pipe';
import { SnippetsService } from './services/snippets.service';
import { SourceService } from './services/source.service';

declare const window: EavWindow;

// AoT requires an exported function for factories
// at least according to https://github.com/ngx-translate/http-loader
export function translateLoaderFactoryCode(http: HttpClient) {
  return new TranslateLoaderWithErrorHandling(http, './i18n/code-editor.', `.js?${window.sxcVersion}`);
}

@NgModule({
  declarations: [
    CodeEditorComponent,
    CodeSnippetsComponent,
    ObjectToArrayPipe,
    CodeTemplatesComponent,
    AceEditorComponent,
    DepthPaddingPipe,
    SortItemsPipe,
  ],
  imports: [
    CodeEditorRoutingModule,
    SharedComponentsModule,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FormsModule,
    MatSelectModule,
    MatRippleModule,
    TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactoryCode)),
    MonacoEditorModule,
  ],
  providers: [
    Context,
    SourceService,
    DialogService,
    SnippetsService,
    TranslateService,
  ]
})
export class CodeEditorModule { }
