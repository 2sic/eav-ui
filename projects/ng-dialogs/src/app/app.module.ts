import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpHeaderInterceptor } from './shared/interceptors/http-header.interceptor';
import { Context } from './shared/context/context';
import { adminEavServiceFactory } from './shared/factories/admin-eav-service.factory';
import { EntityDataModule } from '@ngrx/data';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { entityConfig } from '../../../edit/src/app/shared/store/ngrx-data/entity-metadata';
import { metaReducers } from '../../../edit/src/app/shared/store';
import { EavService } from '../../../edit/src/app/shared/services/eav.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  entryComponents: [
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({}, { metaReducers, runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true } }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    EntityDataModule.forRoot(entityConfig),
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: adminEavServiceFactory, deps: [Injector], multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: HttpHeaderInterceptor, multi: true },
    Context,
    EavService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
