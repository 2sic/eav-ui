import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ItemService } from './shared/services/item.service';
import { ContentTypeService } from './shared/services/content-type.service';
import { metaReducers } from './shared/store';
import { LanguageService } from './shared/services/language.service';
import { ScriptLoaderService } from './shared/services/script.service';
import { EavService } from './shared/services/eav.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AdamService } from './eav-material-controls/adam/adam.service';
import { SvcCreatorService } from './shared/services/svc-creator.service';

import { FeatureService } from './shared/services/feature.service';
import { DnnBridgeService } from './shared/services/dnn-bridge.service';
import { EntityService } from './shared/services/entity.service';
import { HeaderInterceptor } from './shared/interceptors/interceptors';
import { InputTypeService } from './shared/services/input-type.service';
import { EavAdminUiService } from './shared/services/eav-admin-ui.service';
import { OpenMultiItemDialogComponent } from './eav-item-dialog/dialogs/open-multi-item-dialog/open-multi-item-dialog.component';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';
import { QueryService } from './shared/services/query.service';

const routes: Routes = [
  {
    path: '**',
    component: OpenMultiItemDialogComponent
  }
];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './../i18n/ng-edit/', '.json');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    // DropzoneModule,
    StoreModule.forRoot({}, { metaReducers }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    EavItemDialogModule,
    TranslateModule.forRoot(
      {
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        }
      })
  ],
  exports: [RouterModule],
  providers: [
    ItemService,
    ContentTypeService,
    InputTypeService,
    LanguageService,
    ScriptLoaderService,
    EavService,
    AdamService,
    SvcCreatorService,
    FeatureService,
    DnnBridgeService,
    EntityService,
    EavAdminUiService,
    QueryService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
