import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { APP_ADMINISTRATION_DIALOG } from '../shared/constants/navigation-messages';

const appAdministrationRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialogType: APP_ADMINISTRATION_DIALOG }, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: EmptyRouteComponent },
      { path: 'data', component: EmptyRouteComponent },
      { path: 'queries', component: EmptyRouteComponent },
      { path: 'views', component: EmptyRouteComponent },
      { path: 'web-api', component: EmptyRouteComponent },
      { path: 'app', component: EmptyRouteComponent },
      { path: 'global', component: EmptyRouteComponent },
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
