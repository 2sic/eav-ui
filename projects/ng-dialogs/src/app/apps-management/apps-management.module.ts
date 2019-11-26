import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AppsManagementNavigationComponent } from './apps-management-navigation/apps-management-navigation.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { ZoneSettingsComponent } from './zone-settings/zone-settings.component';
import { ManageFeaturesComponent } from './manage-features/manage-features.component';
import { SxcInsightsComponent } from './sxc-insights/sxc-insights.component';
import { AppsManagementHostDialogComponent } from './apps-management-host-dialog/apps-management-host-dialog.component';
import { AppsManagementParamsService } from './shared/apps-management-params.service';
import { AppsManagementHostTabPickerComponent } from './apps-management-host-tab-picker/apps-management-host-tab-picker.component';
import { AppsManagementDialogParamsService } from './shared/apps-management-dialog-params.service';

const routes: Routes = [
  {
    path: '', component: AppsManagementHostDialogComponent, children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list', component: AppsManagementHostTabPickerComponent, children: [
          {
            path: ':appId',
            loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
          }
        ]
      },
      { path: 'settings', component: AppsManagementHostTabPickerComponent },
      { path: 'features', component: AppsManagementHostTabPickerComponent },
      { path: 'sxc-insights', component: AppsManagementHostTabPickerComponent },
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
    AppsManagementHostDialogComponent,
    AppsManagementHostTabPickerComponent,
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
