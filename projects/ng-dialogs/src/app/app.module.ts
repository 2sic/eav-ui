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
import { AppsManagementNavigationComponent } from './apps-management/apps-management-navigation/apps-management-navigation.component';
import { AppsListComponent } from './apps-management/apps-list/apps-list.component';
import { ZoneSettingsComponent } from './apps-management/zone-settings/zone-settings.component';
import { ManageFeaturesComponent } from './apps-management/manage-features/manage-features.component';
import { SxcInsightsComponent } from './apps-management/sxc-insights/sxc-insights.component';
import { AppAdministrationNavigationComponent } from './app-administration/app-administration-navigation/app-administration-navigation.component';
import { GettingStartedComponent } from './app-administration/getting-started/getting-started.component';
import { DataComponent } from './app-administration/data/data.component';
import { QueriesComponent } from './app-administration/queries/queries.component';
import { ViewsComponent } from './app-administration/views/views.component';
import { WebApiComponent } from './app-administration/web-api/web-api.component';
import { AppConfigurationComponent } from './app-administration/app-configuration/app-configuration.component';
import { GlobalSettingsComponent } from './app-administration/global-settings/global-settings.component';

const appRoutes: Routes = [
  {
    path: ':zoneId', component: AppsManagementNavigationComponent, children: [
      { path: '', redirectTo: 'apps', pathMatch: 'full' },
      {
        path: 'apps', component: AppsListComponent, children: [
          {
            path: ':appId', component: AppAdministrationNavigationComponent, children: [
              { path: '', redirectTo: 'home', pathMatch: 'full' },
              { path: 'home', component: GettingStartedComponent },
              { path: 'data', component: DataComponent },
              { path: 'queries', component: QueriesComponent },
              { path: 'views', component: ViewsComponent },
              { path: 'web-api', component: WebApiComponent },
              { path: 'app', component: AppConfigurationComponent },
              { path: 'global', component: GlobalSettingsComponent },
            ]
          },
        ]
      },
      { path: 'settings', component: ZoneSettingsComponent },
      { path: 'features', component: ManageFeaturesComponent },
      { path: 'sxc-insights', component: SxcInsightsComponent },
    ]
  },
  {
    path: ':zoneId/:appId', component: AppAdministrationNavigationComponent, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: GettingStartedComponent },
      { path: 'data', component: DataComponent },
      { path: 'queries', component: QueriesComponent },
      { path: 'views', component: ViewsComponent },
      { path: 'web-api', component: WebApiComponent },
      { path: 'app', component: AppConfigurationComponent },
      { path: 'global', component: GlobalSettingsComponent },
    ]
  },
];

export function adminEavServiceFactory(injector: Injector): Function {
  return function () {
    debugger;
    console.log('Setting admin parameters config and clearing route');
    const isParamsRoute = !window.location.hash.startsWith('#/');
    if (isParamsRoute) {
      // if params route save params and redirect
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
