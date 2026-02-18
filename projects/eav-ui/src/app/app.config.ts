import { SxcHttpInterceptorProvider } from '@2sic.com/sxc-angular';
import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, inject, Injector, provideAppInitializer } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppEntryRouteHandler } from './app-entry-route-handler';
import { routes } from './app.routes';
import { FeaturesService } from './features/features.service';
import { HandleErrorsInterceptor } from './shared/interceptors/handle-errors.interceptor';
import { SetHeadersInterceptor } from './shared/interceptors/set-headers.interceptor';
import { Context } from './shared/services/context';
import { buildTranslateConfiguration } from './shared/translation';
import { translateLoaderFactory } from './shared/translation/translate-loader-factory';

export const appConfig: ApplicationConfig = {

  providers: [
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      TranslateModule.forRoot(),
      TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
    ),
    SxcHttpInterceptorProvider,
    Context,

    // The feature service must be provided in root at first, so it's always there
    // But certain dialogs will want to use their own.
    FeaturesService,

    // App Initializer which will convert long initial routes to nice routes
    provideAppInitializer(() => { new AppEntryRouteHandler(inject(Injector)); }),

    // Activate HTTP client & interceptors.
    // it also uses 2sxc interceptors from the 2sxc module and some from here
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: SetHeadersInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HandleErrorsInterceptor, multi: true },

    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },

    // Special thing to avoid using popover in angular stuff, as it causes trouble with z-indexes
    { provide: OVERLAY_DEFAULT_CONFIG, useValue: { usePopover: false /* Restores legacy overlay behavior */ } }
  ],
};
