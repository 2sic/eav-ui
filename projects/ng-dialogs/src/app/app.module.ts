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
import { AdminDialogComponent } from './admin-dialog/admin-dialog.component';

const appRoutes: Routes = [
];

export function adminEavServiceFactory(injector: Injector): Function {
  return function () {
    debugger;
    console.log('Setting admin parameters config and clearing route');
    const isParamsRoute = !window.location.hash.match(/^#\/[0-9]+\//);
    if (!isParamsRoute) {
      if (sessionStorage.length === 0) {
        alert('Missing required url parameters. Please reopen dialog.');
        throw new Error('Missing required url parameters. Please reopen dialog.');
      } else {
        return;
      }
    }
    const urlHash = window.location.hash.substring(1); // substring removes first # char
    const queryParametersFromUrl = UrlHelper.readQueryStringParameters(urlHash);
    const queryParameters = new QueryParameters();
    Object.keys(queryParameters).forEach(key => {
      if (queryParameters.hasOwnProperty(key)) {
        sessionStorage.setItem(key, queryParametersFromUrl[key]);
      }
    });
    const router = injector.get(Router);
    const zoneId = queryParametersFromUrl['zoneId'];
    router.navigate([`${zoneId}/apps`]);
  };
}

@NgModule({
  declarations: [
    AppComponent,
    AdminDialogComponent,
  ],
  entryComponents: [
    AdminDialogComponent,
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
