import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from '@ag-grid-community/angular';

// material components
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppsManagementRoutingModule } from './apps-management-routing.module';
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
import { AppsListService } from './shared/services/apps-list.service';

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
    AppsManagementRoutingModule,
    CommonModule,
    AgGridModule.withComponents([]),
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  providers: [
    AppsManagementParamsService,
    AppsListService,
    AppsManagementDialogParamsService,
    Context,
  ]
})
export class AppsManagementModule { }
