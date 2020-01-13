import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppAdministrationEntryComponent } from './app-administration-entry/app-administration-entry.component';

const appAdministrationRoutes: Routes = [
  {
    path: '', component: AppAdministrationEntryComponent, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home' },
      { path: 'data' },
      { path: 'queries' },
      { path: 'views' },
      { path: 'web-api' },
      { path: 'app' },
      { path: 'global' },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(appAdministrationRoutes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppAdministrationRoutingModule { }
