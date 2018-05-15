import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule, MetaReducer, ActionReducerMap } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';
import { DnnSxcModule } from '@2sic.com/dnn-sxc-angular';

import { AppComponent } from './app.component';
import { ItemService } from './shared/services/item.service';
import { ContentTypeService } from './shared/services/content-type.service';
import { ItemEffects } from './shared/effects/item.effects';
import { ContentTypeEffects } from './shared/effects/content-type.effects';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import * as fromStore from '../app/shared/store';
import { environment } from '../environments/environment'; // Angular CLI environment
import { reducers, metaReducers } from '../app/shared/store';
import { LanguageService } from './shared/services/language.service';
import { ScriptLoaderService } from './shared/services/script.service';
import { EavService } from './shared/services/eav.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


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
    // StoreModule.forRoot({ items: itemReducer, contentTypes: contentTypeReducer }),
    // StoreModule.forRoot({}),
    StoreModule.forRoot({}, { metaReducers }),
    // EffectsModule.forRoot([ItemEffects, ContentTypeEffects]),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    HttpClientModule,
    // DnnSxcModule,
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
    EavService
    // { provide: APP_BASE_HREF, useValue: '' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
