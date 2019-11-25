import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AppsManagementNavigationComponent } from './apps-management-navigation/apps-management-navigation.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { ZoneSettingsComponent } from './zone-settings/zone-settings.component';
import { ManageFeaturesComponent } from './manage-features/manage-features.component';
import { SxcInsightsComponent } from './sxc-insights/sxc-insights.component';

const routes: Routes = [
  {
    path: '', component: AppsManagementNavigationComponent, children: [
      { path: '', redirectTo: 'apps', pathMatch: 'full' },
      {
        path: 'apps', component: AppsListComponent, children: [
          {
            path: ':appId',
            loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
          }
        ]
      },
      { path: 'settings', component: ZoneSettingsComponent },
      { path: 'features', component: ManageFeaturesComponent },
      { path: 'sxc-insights', component: SxcInsightsComponent },
    ]
  },
];

@NgModule({
  declarations: [
    AppsManagementNavigationComponent,
    AppsListComponent,
    ZoneSettingsComponent,
    ManageFeaturesComponent,
    SxcInsightsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class AppsManagementModule { }
