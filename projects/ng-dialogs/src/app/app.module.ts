import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { UrlHelper } from '../../../../src/app/shared/helpers/url-helper';
import { QueryParameters } from './shared/models/query-parameters.model';
import { AppsManagementModule } from './apps-management/apps-management.module';
import { AppAdministrationModule } from './app-administration/app-administration.module';
import { HttpHeaderInterceptor } from './shared/interceptors/http-header.interceptor';
import { Context } from './shared/context/context';

// TODO: spm - put into own file
const appRoutes: Routes = [
  {
    path: ':zoneId/apps',
    loadChildren: () => import('./apps-management/apps-management.module').then(m => m.AppsManagementModule)
  },
  {
    path: ':zoneId/:appId/app',
    loadChildren: () => import('./app-administration/app-administration.module').then(m => m.AppAdministrationModule)
  },
];

// TODO: spm - put into own file
export function adminEavServiceFactory(injector: Injector): Function {
  return function () {
    console.log('Setting admin parameters config and clearing route');
    const isParamsRoute = !window.location.hash.startsWith('#/');
    if (isParamsRoute) {
      // if params route save params and redirect
      const urlHash = window.location.hash.substring(1); // substring removes first # char
      const queryParametersFromUrl = UrlHelper.readQueryStringParameters(urlHash);
      const queryParameters = new QueryParameters();
      Object.keys(queryParameters).forEach(key => {
        sessionStorage.setItem(key, queryParametersFromUrl[key]);
      });
      const router = injector.get(Router);
      const zoneId = queryParametersFromUrl['zoneId'];
      router.navigate([`${zoneId}/apps`]);
    } else if (sessionStorage.length === 0) {
      // if not params route and no params are saved, e.g. browser was reopened, throw error
      alert('Missing required url parameters. Please reopen dialog.');
      throw new Error('Missing required url parameters. Please reopen dialog.');
    }
  };
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  entryComponents: [
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    HttpClientModule,
    MatDialogModule,
    BrowserAnimationsModule,
    AppsManagementModule,
    AppAdministrationModule
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: adminEavServiceFactory, deps: [Injector], multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: HttpHeaderInterceptor, multi: true },
    Context,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
