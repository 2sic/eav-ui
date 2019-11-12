import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AppAdministrationNavigationComponent } from './app-administration-navigation/app-administration-navigation.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';

const routes: Routes = [
  {
    path: ':zoneId/apps/:appId', component: AppAdministrationNavigationComponent, children: [
      { path: 'home', component: GettingStartedComponent },
      { path: 'data', component: GettingStartedComponent },
      { path: 'queries', component: GettingStartedComponent },
      { path: 'views', component: GettingStartedComponent },
      { path: 'web-api', component: GettingStartedComponent },
      { path: 'app', component: GettingStartedComponent },
      { path: 'global', component: GettingStartedComponent },
    ]
  },
];

@NgModule({
  declarations: [
    GettingStartedComponent,
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
