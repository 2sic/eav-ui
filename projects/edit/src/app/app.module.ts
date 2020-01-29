import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { DnnInterceptor } from '@2sic.com/dnn-sxc-angular';

import { AppComponent } from './app.component';
import { EavService } from './shared/services/eav.service';
import { AdamService } from './eav-material-controls/adam/adam.service';
import { SvcCreatorService } from './shared/services/svc-creator.service';
import { DnnBridgeService } from './shared/services/dnn-bridge.service';
import { EntityService } from './shared/services/entity.service';
import { EavAdminUiService } from './shared/services/eav-admin-ui.service';
import { OpenMultiItemDialogComponent } from './eav-item-dialog/dialogs/open-multi-item-dialog/open-multi-item-dialog.component';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';
import { QueryService } from './shared/services/query.service';
import { HeaderInterceptor } from './shared/interceptors/interceptors';
declare const sxcVersion: string;

const routes: Routes = [
  { path: '', component: OpenMultiItemDialogComponent },
];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', `.js?${sxcVersion}`);
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    EavItemDialogModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    RouterModule,
  ],
  providers: [
    DnnInterceptor,
    EavService,
    AdamService,
    SvcCreatorService,
    DnnBridgeService,
    EntityService,
    EavAdminUiService,
    QueryService,
    { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
  ],
})
export class AppModule { }
