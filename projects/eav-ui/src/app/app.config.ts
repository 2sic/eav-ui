import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, Injector } from '@angular/core';
import { SxcHttpInterceptorProvider } from '@2sic.com/sxc-angular';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { paramsInitFactory } from './params-init.factory';
import { HandleErrorsInterceptor } from './shared/interceptors/handle-errors.interceptor';
import { SetHeadersInterceptor } from './shared/interceptors/set-headers.interceptor';
import { Context } from './shared/services/context';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { buildTranslateConfiguration } from './shared/translation';
import { translateLoaderFactory } from './shared/translation/translate-loader-factory';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FeaturesScopedService } from './features/features-scoped.service';

export const appConfig: ApplicationConfig = {

  providers: [
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      TranslateModule.forRoot(),
      TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
    ),
    SxcHttpInterceptorProvider,
    Context,

    // The feature service must be provided in root at first, so it's always there
    // But certain dialogs will want to use their own.
    FeaturesScopedService,

    { provide: APP_INITIALIZER, useFactory: paramsInitFactory, deps: [Injector], multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: SetHeadersInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HandleErrorsInterceptor, multi: true },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
  ],

};
