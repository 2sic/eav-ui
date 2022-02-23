import { AgGridModule } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';
import { AppDialogConfigService } from '../app-administration/services';
import { Context } from '../shared/services/context';
import { DialogService } from '../shared/services/dialog.service';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { AppsListActionsComponent } from './ag-grid-components/apps-list-actions/apps-list-actions.component';
import { AppsListShowComponent } from './ag-grid-components/apps-list-show/apps-list-show.component';
import { FeaturesListEnabledReasonComponent } from './ag-grid-components/features-list-enabled-reason/features-list-enabled-reason.component';
import { FeaturesListEnabledComponent } from './ag-grid-components/features-list-enabled/features-list-enabled.component';
import { FeaturesStatusComponent } from './ag-grid-components/features-status/features-status.component';
import { SiteLanguagesStatusComponent } from './ag-grid-components/site-languages-status/site-languages-status.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { AppsManagementNavComponent } from './apps-management-nav/apps-management-nav.component';
import { AppsManagementRoutingModule } from './apps-management-routing.module';
import { CreateAppComponent } from './create-app/create-app.component';
import { CreateInheritedAppComponent } from './create-inherited-app/create-inherited-app.component';
import { ActiveFeaturesCountPipe } from './licence-info/active-features-count.pipe';
import { AgGridHeightDirective } from './licence-info/ag-grid-height.directive';
import { FeatureDetailsDialogComponent } from './licence-info/feature-details-dialog/feature-details-dialog.component';
import { LicenseInfoComponent } from './licence-info/license-info.component';
import { LicensesOrderPipe } from './licence-info/licenses-order.pipe';
import { AppsListService } from './services/apps-list.service';
import { FeaturesConfigService } from './services/features-config.service';
import { SxcInsightsService } from './services/sxc-insights.service';
import { ZoneService } from './services/zone.service';
import { SiteLanguagesComponent } from './site-languages/site-languages.component';
import { SystemInfoComponent } from './system-info/system-info.component';

@NgModule({
  declarations: [
    AppsManagementNavComponent,
    AppsListComponent,
    AppsListShowComponent,
    AppsListActionsComponent,
    FeaturesListEnabledComponent,
    SiteLanguagesComponent,
    SiteLanguagesStatusComponent,
    CreateAppComponent,
    CreateInheritedAppComponent,
    SystemInfoComponent,
    FeaturesListEnabledReasonComponent,
    FeaturesStatusComponent,
    LicenseInfoComponent,
    LicensesOrderPipe,
    AgGridHeightDirective,
    ActiveFeaturesCountPipe,
    FeatureDetailsDialogComponent,
  ],
  imports: [
    AppsManagementRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    CommonModule,
    AgGridModule.withComponents([]),
    MatButtonModule,
    MatIconModule,
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
    MatSnackBarModule,
    MatExpansionModule,
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
