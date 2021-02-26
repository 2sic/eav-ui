import { DnnInterceptor } from '@2sic.com/dnn-sxc-angular';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EntityDataModule } from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateModule } from '@ngx-translate/core';
import { metaReducers, reducers } from '../../../edit/shared/store';
import { entityConfig } from '../../../edit/shared/store/ngrx-data';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { paramsInitFactory } from './params-init.factory';
import { HandleErrorsInterceptor } from './shared/interceptors/handle-errors.interceptor';
import { SetHeadersInterceptor } from './shared/interceptors/set-headers.interceptor';
import { Context } from './shared/services/context';

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
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
