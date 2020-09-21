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
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SanitizeService } from '../../../../edit/eav-material-controls/adam/sanitize.service';
import { Context } from '../shared/services/context';
import { DialogService } from '../shared/services/dialog.service';
import { SharedComponentsModule } from '../shared/shared-components.module';
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

declare const sxcVersion: string;

export function translateLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/code-editor.', `.js?${sxcVersion}`);
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
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (translateLoaderFactory),
        deps: [HttpClient],
      },
      defaultLanguage: 'en',
      isolate: true,
    }),
  ],
  providers: [
    Context,
    SourceService,
    DialogService,
    SnippetsService,
    SanitizeService,
    TranslateService,
  ]
})
export class CodeEditorModule { }
