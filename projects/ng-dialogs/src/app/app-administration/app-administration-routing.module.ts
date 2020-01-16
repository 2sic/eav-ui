import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from '../shared/components/empty-route/empty-route.component';
import { APP_ADMINISTRATION_DIALOG, ADD_CONTENT_TYPE_DIALOG, EDIT_CONTENT_TYPE_DIALOG } from '../shared/constants/navigation-messages';

const appAdministrationRoutes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialogType: APP_ADMINISTRATION_DIALOG }, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: EmptyRouteComponent },
      {
        path: 'data', component: EmptyRouteComponent, children: [
          { path: ':scope/add', component: DialogEntryComponent, data: { dialogType: ADD_CONTENT_TYPE_DIALOG } },
          { path: ':scope/:id/edit', component: DialogEntryComponent, data: { dialogType: EDIT_CONTENT_TYPE_DIALOG } },
        ]
      },
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
