import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { EntityDataModule } from '@ngrx/data';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { DnnInterceptor } from '@2sic.com/dnn-sxc-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Context } from './shared/context/context';
import { paramsInitFactory } from './shared/factories/params-init.factory';
import { entityConfig } from '../../../edit/shared/store/ngrx-data/entity-metadata';
import { metaReducers } from '../../../edit/shared/store';
import { HttpHeaderInterceptor } from './shared/interceptors/http-header.interceptor';
import { SharedComponentsModule } from './shared/components/shared-components.module';

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
    StoreModule.forRoot({}, { metaReducers, runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true } }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    EntityDataModule.forRoot(entityConfig),
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: paramsInitFactory, deps: [Injector], multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    DnnInterceptor,
    { provide: HTTP_INTERCEPTORS, useClass: HttpHeaderInterceptor, multi: true },
    Context,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
