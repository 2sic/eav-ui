import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AppsListComponent } from './apps-list/apps-list.component';

const routes: Routes = [
  { path: ':zoneId/apps', component: AppsListComponent },
];

@NgModule({
  declarations: [
    AppsListComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class AppsManagementModule { }
