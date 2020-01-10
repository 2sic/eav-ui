import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from '@ag-grid-community/angular';

// material components
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';

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
import { FeaturesListEnabledComponent } from './shared/ag-grid-components/features-list-enabled/features-list-enabled.component';
import { FeaturesListUiComponent } from './shared/ag-grid-components/features-list-ui/features-list-ui.component';
import { FeaturesListPublicComponent } from './shared/ag-grid-components/features-list-public/features-list-public.component';
import { FeaturesListSecurityComponent } from './shared/ag-grid-components/features-list-security/features-list-security.component';
import { ImportAppComponent } from './shared/modals/import-app/import-app.component';
import { ImportAppService } from './shared/services/import-app.service';
import { EnableLanguagesComponent } from './shared/modals/enable-languages/enable-languages.component';
import { EnableLanguagesService } from './shared/services/enable-languages.service';
import { EnableLanguagesStatusComponent } from './shared/ag-grid-components/enable-languages-status/enable-languages-status.component';
import { FeaturesConfigService } from './shared/services/features-config.service';

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
    FeaturesListEnabledComponent,
    FeaturesListUiComponent,
    FeaturesListPublicComponent,
    FeaturesListSecurityComponent,
    ImportAppComponent,
    EnableLanguagesComponent,
    EnableLanguagesStatusComponent,
  ],
  entryComponents: [
    AppsManagementNavComponent,
    AppsListShowComponent,
    AppsListActionsComponent,
    FeaturesListEnabledComponent,
    FeaturesListUiComponent,
    FeaturesListPublicComponent,
    FeaturesListSecurityComponent,
    ImportAppComponent,
    EnableLanguagesComponent,
    EnableLanguagesStatusComponent,
  ],
  imports: [
    AppsManagementRoutingModule,
    MatDialogModule,
    CommonModule,
    AgGridModule.withComponents([]),
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatTabsModule,
  ],
  providers: [
    AppsManagementParamsService,
    AppsListService,
    EnableLanguagesService,
    AppsManagementDialogParamsService,
    Context,
    ImportAppService,
    FeaturesConfigService,
  ]
})
export class AppsManagementModule { }
