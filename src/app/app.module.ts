import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule, MetaReducer, ActionReducerMap } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ItemService } from './shared/services/item.service';
import { ContentTypeService } from './shared/services/content-type.service';
// import { itemReducer, contentTypeReducer } from './shared/store/reducers';
import { ItemEffects } from './shared/effects/item.effects';
import { ContentTypeEffects } from './shared/effects/content-type.effects';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import * as fromStore from '../app/shared/store';
import { environment } from '../environments/environment'; // Angular CLI environment
import { reducers, metaReducers } from '../app/shared/store';
import { LanguageService } from './shared/services/language.service';
import { ScriptLoaderService } from './shared/services/script.service';
import { APP_BASE_HREF, Location } from '@angular/common';

const routes: Routes = [
  {
    path: 'eav-item-dialog',
    loadChildren: 'app/eav-item-dialog/eav-item-dialog.module#EavItemDialogModule'
  },
  {
    path: '',
    redirectTo: '',
    // redirectTo: 'eav-item-dialog',
    pathMatch: 'full'
  }
];

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
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
  ],
  exports: [RouterModule],
  providers: [
    ItemService,
    ContentTypeService,
    LanguageService,
    ScriptLoaderService,
    { provide: APP_BASE_HREF, useValue: '' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
