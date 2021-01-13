import { DnnInterceptor } from '@2sic.com/dnn-sxc-angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Context } from '../ng-dialogs/src/app/shared/services/context';
import { SharedComponentsModule } from '../ng-dialogs/src/app/shared/shared-components.module';
import { buildTranslateConfiguration, TranslateLoaderWithErrorHandling } from '../ng-dialogs/src/app/shared/translation';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';
import { AdamService } from './eav-material-controls/adam/adam.service';
import { EditRoutingModule } from './edit-routing.module';
import { DnnBridgeService } from './shared/services/dnn-bridge.service';
import { EavService } from './shared/services/eav.service';
import { EntityService } from './shared/services/entity.service';
import { QueryService } from './shared/services/query.service';

declare const sxcVersion: string;

// AoT requires an exported function for factories
// at least according to https://github.com/ngx-translate/http-loader
export function translateLoaderFactoryEdit(http: HttpClient): TranslateLoader {
  return new TranslateLoaderWithErrorHandling(http, './i18n/', `.js?${sxcVersion}`);
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
    DnnBridgeService,
    EntityService,
    QueryService,
  ],
})
export class EditModule { }
