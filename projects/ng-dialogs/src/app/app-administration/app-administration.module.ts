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
import { AppAdministrationRouterComponent } from './app-administration-router/app-administration-router.component';
import { AppAdministrationDummyComponent } from './app-administration-dummy/app-administration-dummy.component';

const routes: Routes = [
  {
    path: '', component: AppAdministrationRouterComponent, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: AppAdministrationDummyComponent },
      { path: 'data', component: AppAdministrationDummyComponent },
      { path: 'queries', component: AppAdministrationDummyComponent },
      { path: 'views', component: AppAdministrationDummyComponent },
      { path: 'web-api', component: AppAdministrationDummyComponent },
      { path: 'app', component: AppAdministrationDummyComponent },
      { path: 'global', component: AppAdministrationDummyComponent },
    ]
  },
];

// const routes: Routes = [
//   {
//     path: '', component: AppAdministrationNavigationComponent, children: [
//       { path: '', redirectTo: 'home', pathMatch: 'full' },
//       { path: 'home', component: GettingStartedComponent },
//       { path: 'data', component: DataComponent },
//       { path: 'queries', component: QueriesComponent },
//       { path: 'views', component: ViewsComponent },
//       { path: 'web-api', component: WebApiComponent },
//       { path: 'app', component: AppConfigurationComponent },
//       { path: 'global', component: GlobalSettingsComponent },
//     ]
//   },
// ];

@NgModule({
  declarations: [
    GettingStartedComponent,
    AppAdministrationNavigationComponent,
    DataComponent,
    QueriesComponent,
    ViewsComponent,
    WebApiComponent,
    AppConfigurationComponent,
    GlobalSettingsComponent,
    AppAdministrationRouterComponent,
    AppAdministrationDummyComponent
  ],
  entryComponents: [
    AppAdministrationNavigationComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ],
  providers: [
  ]
})
export class AppAdministrationModule { }
