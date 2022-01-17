import { AgGridModule } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';
import { AppDialogConfigService } from '../app-administration/services';
import { Context } from '../shared/services/context';
import { DialogService } from '../shared/services/dialog.service';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { AppsListActionsComponent } from './ag-grid-components/apps-list-actions/apps-list-actions.component';
import { AppsListShowComponent } from './ag-grid-components/apps-list-show/apps-list-show.component';
import { EnableLanguagesStatusComponent } from './ag-grid-components/enable-languages-status/enable-languages-status.component';
import { FeaturesListEnabledComponent } from './ag-grid-components/features-list-enabled/features-list-enabled.component';
import { FeaturesListNameComponent } from './ag-grid-components/features-list-name/features-list-name.component';
import { FeaturesListPublicComponent } from './ag-grid-components/features-list-public/features-list-public.component';
import { FeaturesListSecurityComponent } from './ag-grid-components/features-list-security/features-list-security.component';
import { FeaturesListUiComponent } from './ag-grid-components/features-list-ui/features-list-ui.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { AppsManagementNavComponent } from './apps-management-nav/apps-management-nav.component';
import { AppsManagementRoutingModule } from './apps-management-routing.module';
import { CreateAppComponent } from './create-app/create-app.component';
import { CreateInheritedAppComponent } from './create-inherited-app/create-inherited-app.component';
import { EnableLanguagesComponent } from './enable-languages/enable-languages.component';
import { ManageFeaturesComponent } from './manage-features/manage-features.component';
import { AppsListService } from './services/apps-list.service';
import { FeaturesConfigService } from './services/features-config.service';
import { SxcInsightsService } from './services/sxc-insights.service';
import { ZoneService } from './services/zone.service';
import { SxcInsightsComponent } from './sxc-insights/sxc-insights.component';
import { SystemInfoComponent } from './system-info/system-info.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';

@NgModule({
  declarations: [
    AppsManagementNavComponent,
    AppsListComponent,
    ManageFeaturesComponent,
    SxcInsightsComponent,
    AppsListShowComponent,
    AppsListActionsComponent,
    FeaturesListEnabledComponent,
    FeaturesListUiComponent,
    FeaturesListPublicComponent,
    FeaturesListNameComponent,
    FeaturesListSecurityComponent,
    EnableLanguagesComponent,
    EnableLanguagesStatusComponent,
    SystemSettingsComponent,
    CreateAppComponent,
    CreateInheritedAppComponent,
    SystemInfoComponent,
  ],
  imports: [
    AppsManagementRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    CommonModule,
    AgGridModule.withComponents([]),
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatRippleModule,
    EcoFabSpeedDialModule,
    MatCardModule,
    FormsModule,
    MatInputModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatSelectModule,
  ],
  providers: [
    Context,
    AppsListService,
    ZoneService,
    FeaturesConfigService,
    SxcInsightsService,
    DialogService,
    AppDialogConfigService,
  ],
})
export class AppsManagementModule { }
