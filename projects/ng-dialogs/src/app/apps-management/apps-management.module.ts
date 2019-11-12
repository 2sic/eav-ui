import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AppsManagementNavigationComponent } from './apps-management-navigation/apps-management-navigation.component';
import { AppsListComponent } from './apps-list/apps-list.component';

const routes: Routes = [
  {
    path: ':zoneId', component: AppsManagementNavigationComponent, children: [
      { path: 'apps', component: AppsListComponent },
    ]
  },
];

@NgModule({
  declarations: [
    AppsManagementNavigationComponent,
    AppsListComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class AppsManagementModule { }
