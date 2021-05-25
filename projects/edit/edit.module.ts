import { DnnInterceptor } from '@2sic.com/dnn-sxc-angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { EavWindow } from '../ng-dialogs/src/app/shared/models/eav-window.model';
import { Context } from '../ng-dialogs/src/app/shared/services/context';
import { SharedComponentsModule } from '../ng-dialogs/src/app/shared/shared-components.module';
import { buildTranslateConfiguration, TranslateLoaderWithErrorHandling } from '../ng-dialogs/src/app/shared/translation';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';
import { AdamService } from './eav-material-controls/adam/adam.service';
import { EditRoutingModule } from './edit-routing.module';
import { EavService, EntityService, QueryService } from './shared/services';

declare const window: EavWindow;

// AoT requires an exported function for factories
// at least according to https://github.com/ngx-translate/http-loader
export function translateLoaderFactoryEdit(http: HttpClient): TranslateLoader {
  return new TranslateLoaderWithErrorHandling(http, './i18n/', `.js?${window.sxcVersion}`);
}

@NgModule({
  declarations: [
  ],
  entryComponents: [
  ],
  imports: [
    EditRoutingModule,
    SharedComponentsModule,
    CommonModule,
    EavItemDialogModule,
    TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactoryEdit))
  ],
  providers: [
    Context,
    DnnInterceptor,
    EavService,
    AdamService,
    EntityService,
    QueryService,
  ],
})
export class EditModule { }
