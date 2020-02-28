import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EntityDataModule } from '@ngrx/data';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { DnnInterceptor } from '@2sic.com/dnn-sxc-angular';
import { TranslateModule } from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Context } from './shared/context/context';
import { paramsInitFactory } from './shared/factories/params-init.factory';
import { entityConfig } from '../../../edit/shared/store/ngrx-data/entity-metadata';
import { metaReducers, reducers } from '../../../edit/shared/store';
import { SetHeadersInterceptor } from './shared/interceptors/set-headers.interceptor';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { HandleErrorsInterceptor } from './shared/interceptors/handle-errors.interceptor';

@NgModule({
  declarations: [
    AppComponent,
  ],
  entryComponents: [
  ],
  imports: [
    AppRoutingModule,
    SharedComponentsModule.forRoot(),
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    StoreModule.forRoot(reducers, { metaReducers, runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true } }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    EntityDataModule.forRoot(entityConfig),
    TranslateModule.forRoot(),
    MatSnackBarModule,
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: paramsInitFactory, deps: [Injector], multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    DnnInterceptor,
    { provide: HTTP_INTERCEPTORS, useClass: SetHeadersInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HandleErrorsInterceptor, multi: true },
    Context,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
