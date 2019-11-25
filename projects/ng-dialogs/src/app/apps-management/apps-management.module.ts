import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AppsManagementNavigationComponent } from './apps-management-navigation/apps-management-navigation.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { ZoneSettingsComponent } from './zone-settings/zone-settings.component';
import { ManageFeaturesComponent } from './manage-features/manage-features.component';
import { SxcInsightsComponent } from './sxc-insights/sxc-insights.component';
import { AppsManagementRouterComponent } from './apps-management-router/apps-management-router.component';
import { AppsManagementParamsService } from './shared/apps-management-params.service';
import { AppsManagementDummyComponent } from './apps-management-dummy/apps-management-dummy.component';
import { AppsManagementDialogParamsService } from './shared/apps-management-dialog-params.service';

const routes: Routes = [
  {
    path: '', component: AppsManagementRouterComponent, children: [
      { path: '', redirectTo: 'apps', pathMatch: 'full' },
      {
        path: 'apps', component: AppsManagementDummyComponent, children: [
          {
            path: ':appId',
            loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
          }
        ]
      },
      { path: 'settings', component: AppsManagementDummyComponent },
      { path: 'features', component: AppsManagementDummyComponent },
      { path: 'sxc-insights', component: AppsManagementDummyComponent },
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
    AppsManagementRouterComponent,
    AppsManagementDummyComponent,
  ],
  entryComponents: [
    AppsManagementNavigationComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ],
  providers: [
    AppsManagementParamsService,
    AppsManagementDialogParamsService
  ]
})
export class AppsManagementModule { }
