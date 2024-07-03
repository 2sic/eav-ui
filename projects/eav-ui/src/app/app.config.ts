import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, Injector } from '@angular/core';
import { SxcHttpInterceptorProvider } from '@2sic.com/sxc-angular';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { paramsInitFactory } from './params-init.factory';
import { AppIconsService } from './shared/icons/app-icons.service';
import { HandleErrorsInterceptor } from './shared/interceptors/handle-errors.interceptor';
import { SetHeadersInterceptor } from './shared/interceptors/set-headers.interceptor';
import { AppInstallSettingsService } from './shared/services/getting-started.service';
import { InstallerService } from './shared/services/installer.service';
import { Context } from './shared/services/context';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { metaReducers, reducers } from './edit/shared/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EntityDataModule } from '@ngrx/data';
import { entityConfig } from './edit/shared/store/ngrx-data';
import { TranslateModule } from '@ngx-translate/core';
import { buildTranslateConfiguration } from './shared/translation';
import { translateLoaderFactory } from './shared/translation/translate-loader-factory';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

export const appConfig: ApplicationConfig = {

  providers: [
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      StoreModule.forRoot(reducers, { metaReducers, runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true } }),
      EffectsModule.forRoot([]),
      StoreDevtoolsModule.instrument({ maxAge: 25 }),
      EntityDataModule.forRoot(entityConfig),
      TranslateModule.forRoot(),
      TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
    ),
    SxcHttpInterceptorProvider,
    Context,
    Title,
    AppIconsService,
    AppInstallSettingsService,// copied from 2sxc-ui
    InstallerService,// copied from 2sxc-ui
    { provide: APP_INITIALIZER, useFactory: paramsInitFactory, deps: [Injector], multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: SetHeadersInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HandleErrorsInterceptor, multi: true },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
  ],

};
