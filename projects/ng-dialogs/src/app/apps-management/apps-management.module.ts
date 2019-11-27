import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AppsManagementNavigationComponent } from './apps-management-navigation/apps-management-navigation.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { ZoneSettingsComponent } from './zone-settings/zone-settings.component';
import { ManageFeaturesComponent } from './manage-features/manage-features.component';
import { SxcInsightsComponent } from './sxc-insights/sxc-insights.component';
import { AppsManagementEntryComponent } from './apps-management-entry/apps-management-entry.component';
import { AppsManagementParamsService } from './shared/apps-management-params.service';
import { AppsManagementHostTabPickerComponent } from './apps-management-host-tab-picker/apps-management-host-tab-picker.component';
import { AppsManagementDialogParamsService } from './shared/apps-management-dialog-params.service';
import { Context } from '../shared/context/context';

const routes: Routes = [
  {
    path: '', component: AppsManagementEntryComponent, children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: AppsManagementHostTabPickerComponent },
      { path: 'settings', component: AppsManagementHostTabPickerComponent },
      { path: 'features', component: AppsManagementHostTabPickerComponent },
      { path: 'sxc-insights', component: AppsManagementHostTabPickerComponent },
      {
        path: ':appId',
        loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
      },
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
    AppsManagementEntryComponent,
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
    AppsManagementDialogParamsService,
    Context,
  ]
})
export class AppsManagementModule { }
