import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AppAdministrationNavigationComponent } from './app-administration-navigation/app-administration-navigation.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { DataComponent } from './data/data.component';
import { QueriesComponent } from './queries/queries.component';
import { ViewsComponent } from './views/views.component';
import { WebApiComponent } from './web-api/web-api.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { GlobalSettingsComponent } from './global-settings/global-settings.component';

const routes: Routes = [
  {
    path: ':zoneId/apps/:appId', component: AppAdministrationNavigationComponent, children: [
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

@NgModule({
  declarations: [
    GettingStartedComponent,
    AppAdministrationNavigationComponent,
    DataComponent,
    QueriesComponent,
    ViewsComponent,
    WebApiComponent,
    AppConfigurationComponent,
    GlobalSettingsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ],
  providers: [
  ]
})
export class AppAdministrationModule { }
