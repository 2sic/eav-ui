// import { SxcHttpInterceptorProvider } from '@2sic.com/sxc-angular';
// import { HashLocationStrategy, LocationStrategy } from '@angular/common';
// import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
// import { BrowserModule, Title } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { EntityDataModule } from '@ngrx/data';
// import { EffectsModule } from '@ngrx/effects';
// import { StoreModule } from '@ngrx/store';
// import { StoreDevtoolsModule } from '@ngrx/store-devtools';
// import { TranslateModule } from '@ngx-translate/core';
// import { AppIconsService } from './shared/icons/app-icons.service';
// import { AppComponent } from './app.component';
// import { metaReducers, reducers } from './edit/shared/store';
// import { entityConfig } from './edit/shared/store/ngrx-data';
// import { paramsInitFactory } from './params-init.factory';
// import { HandleErrorsInterceptor } from './shared/interceptors/handle-errors.interceptor';
// import { SetHeadersInterceptor } from './shared/interceptors/set-headers.interceptor';
// import { Context } from './shared/services/context';
// import { AppInstallSettingsService } from './shared/services/getting-started.service';
// import { InstallerService } from './shared/services/installer.service';
// import { buildTranslateConfiguration } from './shared/translation';
// import { translateLoaderFactory } from './shared/translation/translate-loader-factory';
// import { RouterModule } from '@angular/router';

// @NgModule({
//   declarations: [
//     // AppComponent,
//   ],
//   imports: [
//     // AppRoutingModule,
//     // BrowserModule,
//     // HttpClientModule,
//     // BrowserAnimationsModule,
//     // StoreModule.forRoot(reducers, { metaReducers, runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true } }),
//     // EffectsModule.forRoot([]),
//     // StoreDevtoolsModule.instrument({ maxAge: 25 }),
//     // EntityDataModule.forRoot(entityConfig),
//     // Use to load translations for the app
//     // TranslateModule.forRoot(),
//     // TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),

//     // Remove after Test
//     // MatSnackBarModule,
//   ],
//   // providers: [
//   //   { provide: APP_INITIALIZER, useFactory: paramsInitFactory, deps: [Injector], multi: true },
//   //   { provide: LocationStrategy, useClass: HashLocationStrategy },
//   //   SxcHttpInterceptorProvider,
//   //   { provide: HTTP_INTERCEPTORS, useClass: SetHeadersInterceptor, multi: true },
//   //   { provide: HTTP_INTERCEPTORS, useClass: HandleErrorsInterceptor, multi: true },
//   //   Context,
//   //   Title,
//   //   AppIconsService,
//   //   AppInstallSettingsService,// copied from 2sxc-ui
//   //   InstallerService,// copied from 2sxc-ui
//   // ],
//   // bootstrap: [AppComponent],
// })
// export class AppModule { }
