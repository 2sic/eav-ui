import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CreateFileDialogModule } from '../create-file-dialog';
import { MonacoEditorModule } from '../monaco-editor';
import { EavWindow } from '../shared/models/eav-window.model';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { buildTranslateConfiguration, TranslateLoaderWithErrorHandling } from '../shared/translation';
import { CodeAndEditionWarningsComponent } from './code-and-edition-warnings/code-and-edition-warnings.component';
import { CodeEditorRoutingModule } from './code-editor-routing.module';
import { CodeEditorComponent } from './code-editor.component';
import { CodeSnippetsComponent } from './code-snippets/code-snippets.component';
import { ObjectToArrayPipe } from './code-snippets/object-to-array.pipe';
import { CodeTemplatesComponent } from './code-templates/code-templates.component';
import { DepthPaddingPipe } from './code-templates/depth-padding.pipe';
import { SortItemsPipe } from './code-templates/order-items.pipe';
import { SnippetsService } from './services/snippets.service';
import { SourceService } from './services/source.service';
import { MatMenuModule } from '@angular/material/menu';

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
    DepthPaddingPipe,
    SortItemsPipe,
    CodeAndEditionWarningsComponent,
  ],
  imports: [
    CodeEditorRoutingModule,
    SharedComponentsModule,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatRippleModule,
    MatMenuModule,
    TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactoryCode)),
    MonacoEditorModule,
    MatProgressSpinnerModule,
    CreateFileDialogModule,
  ],
  providers: [
    Context,
    SourceService,
    SnippetsService,
    TranslateService,
  ],
})
export class CodeEditorModule { }
