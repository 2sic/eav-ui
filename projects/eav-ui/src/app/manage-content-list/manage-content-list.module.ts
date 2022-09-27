import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ManageContentListRoutingModule } from './manage-content-list-routing.module';
import { ManageContentListComponent } from './manage-content-list.component';
import { ContentGroupService } from './services/content-group.service';
import { HttpClient } from '@angular/common/http';
import { EavWindow } from '../shared/models/eav-window.model';
import { buildTranslateConfiguration, TranslateLoaderWithErrorHandling } from '../shared/translation';
import { EavService } from '../edit/shared/services';
import { LanguageInitializerService } from '../shared/services/language-initializer.service';

declare const window: EavWindow;

// AoT requires an exported function for factories
// at least according to https://github.com/ngx-translate/http-loader
export function translateLoaderFactoryContentList(http: HttpClient): TranslateLoader {
  return new TranslateLoaderWithErrorHandling(http, './i18n/', `.js?${window.sxcVersion}`);
}

@NgModule({
  declarations: [
    ManageContentListComponent,
  ],
  imports: [
    CommonModule,
    ManageContentListRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    MatSnackBarModule,
    TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactoryContentList)),
  ],
  providers: [
    Context,
    ContentGroupService,
    EavService,
    LanguageInitializerService
  ]
})
export class ManageContentListModule { }
