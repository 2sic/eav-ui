import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ItemService } from './shared/services/item.service';
import { ContentTypeService } from './shared/services/content-type.service';
import { metaReducers } from '../app/shared/store';
import { LanguageService } from './shared/services/language.service';
import { ScriptLoaderService } from './shared/services/script.service';
import { EavService } from './shared/services/eav.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AdamService } from './eav-material-controls/adam/adam.service';
import { SvcCreatorService } from './shared/services/svc-creator.service';

// import {
//   DropzoneModule, DropzoneConfigInterface,
//   DROPZONE_CONFIG
// } from 'ngx-dropzone-wrapper';
import { FeatureService } from './shared/services/feature.service';
import { DnnBridgeService } from './shared/services/dnn-bridge.service';

// const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
//   // Change this to your upload POST address:
//   url: 'http://2sxc-dnn742.dnndev.me/',
//   acceptedFiles: 'image/*',
//   createImageThumbnails: true
// };

const routes: Routes = [
  {
    path: 'eav-item-dialog',
    loadChildren: 'app/eav-item-dialog/eav-item-dialog.module#EavItemDialogModule'
  },
  // {
  //   path: '',
  //   redirectTo: '',
  //   // redirectTo: 'eav-item-dialog',
  //   pathMatch: 'full'
  // },
  {
    path: '**',
    redirectTo: 'eav-item-dialog',
  }
];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
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
    TranslateModule.forRoot()
    //     {
    //     loader: {
    //       provide: TranslateLoader,
    //       useFactory: (createTranslateLoader),
    //       deps: [HttpClient]
    //     }
    //   }
    // )
  ],
  exports: [RouterModule],
  providers: [
    ItemService,
    ContentTypeService,
    LanguageService,
    ScriptLoaderService,
    EavService,
    AdamService,
    SvcCreatorService,
    FeatureService,
    DnnBridgeService
    // {
    //   provide: DROPZONE_CONFIG,
    //   useValue: DEFAULT_DROPZONE_CONFIG
    // }
    // { provide: APP_BASE_HREF, useValue: '' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
