import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminNavigationComponent } from './admin-navigation/admin-navigation.component';
import { HomeComponent } from './home/home.component';
import { TestToken, testTokenFactory } from './test-token';
import { AppToken, appTokenFactory } from './app-token';

console.log(6, 'submodule');

const routes: Routes = [
  {
    path: ':zoneId/apps/:appId', component: AdminNavigationComponent, children: [
      { path: 'home', component: HomeComponent },
    ]
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    AdminNavigationComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ],
  providers: [
    { provide: TestToken, useFactory: testTokenFactory, deps: [APP_INITIALIZER] },
    { provide: AppToken, useFactory: appTokenFactory, deps: [APP_INITIALIZER] },
  ]
})
export class AppAdministrationModule { }
