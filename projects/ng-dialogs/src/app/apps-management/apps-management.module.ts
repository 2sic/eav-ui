import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AgGridModule } from '@ag-grid-community/angular';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppsManagementNavComponent } from './apps-management-nav/apps-management-nav.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { ZoneSettingsComponent } from './zone-settings/zone-settings.component';
import { ManageFeaturesComponent } from './manage-features/manage-features.component';
import { SxcInsightsComponent } from './sxc-insights/sxc-insights.component';
import { AppsManagementEntryComponent } from './apps-management-entry/apps-management-entry.component';
import { AppsManagementParamsService } from './shared/services/apps-management-params.service';
import { AppsManagementTabPickerComponent } from './apps-management-tab-picker/apps-management-tab-picker.component';
import { AppsManagementDialogParamsService } from './shared/services/apps-management-dialog-params.service';
import { Context } from '../shared/context/context';
import { AppsListShowComponent } from './shared/ag-grid-components/apps-list-show/apps-list-show.component';
import { AppsListActionsComponent } from './shared/ag-grid-components/apps-list-actions/apps-list-actions.component';

const routes: Routes = [
  {
    path: '', component: AppsManagementEntryComponent, children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: AppsManagementTabPickerComponent },
      { path: 'settings', component: AppsManagementTabPickerComponent },
      { path: 'features', component: AppsManagementTabPickerComponent },
      { path: 'sxc-insights', component: AppsManagementTabPickerComponent },
      {
        path: ':appId',
        loadChildren: () => import('../app-administration/app-administration.module').then(m => m.AppAdministrationModule)
      },
    ]
  },
];

@NgModule({
  declarations: [
    AppsManagementNavComponent,
    AppsListComponent,
    ZoneSettingsComponent,
    ManageFeaturesComponent,
    SxcInsightsComponent,
    AppsManagementEntryComponent,
    AppsManagementTabPickerComponent,
    AppsListShowComponent,
    AppsListActionsComponent,
  ],
  entryComponents: [
    AppsManagementNavComponent,
    AppsListShowComponent,
    AppsListActionsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    AgGridModule.withComponents([]),
    MatButtonModule,
    MatIconModule,
  ],
  providers: [
    AppsManagementParamsService,
    AppsManagementDialogParamsService,
    Context,
  ]
})
export class AppsManagementModule { }
