import { buildTranslateConfiguration, TranslateLoaderWithErrorHandling } from '../shared/translation';
import { CodeEditorRoutingModule } from './code-editor-routing.module';
import { SnippetsService } from './services/snippets.service';
import { SourceService } from './services/source.service';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EavWindow } from '../shared/models/eav-window.model';
import { Context } from '../shared/services/context';

// import { CreateFileDialogModule } from '../create-file-dialog';
// import { SharedComponentsModule } from '../shared/shared-components.module';
// import { CodeAndEditionWarningsComponent } from './code-and-edition-warnings/code-and-edition-warnings.component';
// import { CodeEditorComponent } from './code-editor.component';
// import { CodeSnippetsComponent } from './code-snippets/code-snippets.component';
// import { ObjectToArrayPipe } from './code-snippets/object-to-array.pipe';
// import { CodeTemplatesComponent } from './code-templates/code-templates.component';
// import { DepthPaddingPipe } from './code-templates/depth-padding.pipe';
// import { SortItemsPipe } from './code-templates/order-items.pipe';


declare const window: EavWindow;

// AoT requires an exported function for factories
// at least according to https://github.com/ngx-translate/http-loader
export function translateLoaderFactoryCode(http: HttpClient) {
  return new TranslateLoaderWithErrorHandling(http, './i18n/code-editor.', `.js?${window.sxcVersion}`);
}

@NgModule({
    imports: [
      CodeEditorRoutingModule,
      TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactoryCode)),

      // TODO:: Remove after Test
        // CreateFileDialogModule,
        // CodeEditorComponent,
        // CodeSnippetsComponent,
        // ObjectToArrayPipe,
        // CodeTemplatesComponent,
        // DepthPaddingPipe,
        // SortItemsPipe,
        // CodeAndEditionWarningsComponent,
    ],
    providers: [
        Context,
        SourceService,
        SnippetsService,
    ],
})
export class CodeEditorModule { }
