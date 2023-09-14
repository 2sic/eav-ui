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
import { MAT_SELECT_CONFIG, MatSelectModule } from '@angular/material/select';
import { MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';
import { AppDialogConfigService } from '../app-administration/services';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { DialogService } from '../shared/services/dialog.service';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { AppsListActionsComponent } from './apps-list/apps-list-actions/apps-list-actions.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { AppsManagementNavComponent } from './apps-management-nav/apps-management-nav.component';
import { AppsManagementRoutingModule } from './apps-management-routing.module';
import { CreateAppComponent } from './create-app/create-app.component';
import { CreateInheritedAppComponent } from './create-inherited-app/create-inherited-app.component';
import { AddAppFromFolderComponent } from './add-app-from-folder/add-app-from-folder.component';
import { ActiveFeaturesCountPipe } from './licence-info/active-features-count.pipe';
import { AgGridHeightDirective } from './licence-info/ag-grid-height.directive';
import { FeatureDetailsDialogComponent } from './licence-info/feature-details-dialog/feature-details-dialog.component';
import { FeaturesListEnabledReasonComponent } from './licence-info/features-list-enabled-reason/features-list-enabled-reason.component';
import { FeaturesListEnabledComponent } from './licence-info/features-list-enabled/features-list-enabled.component';
import { FeaturesStatusComponent } from './licence-info/features-status/features-status.component';
import { LicenseInfoComponent } from './licence-info/license-info.component';
import { LicensesOrderPipe } from './licence-info/licenses-order.pipe';
import { AppsListService } from './services/apps-list.service';
import { FeaturesConfigService } from './services/features-config.service';
import { SxcInsightsService } from './services/sxc-insights.service';
import { ZoneService } from './services/zone.service';
import { SiteLanguagesStatusComponent } from './site-languages/site-languages-status/site-languages-status.component';
import { SiteLanguagesComponent } from './site-languages/site-languages.component';
import { RegistrationComponent } from './sub-dialogs/registration/registration.component';
import { SystemInfoComponent } from './system-info/system-info.component';
import { AppNameShowComponent } from './add-app-from-folder/app-name-show/app-name-show.component';
import { CheckboxCellComponent } from './add-app-from-folder/checkbox-cell/checkbox-cell.component';
import { MatBadgeModule } from '@angular/material/badge';
import { FeaturesModule } from '../features/features.module';

@NgModule({
  declarations: [
    AppNameShowComponent,
    AppsManagementNavComponent,
    AppsListComponent,
    // AppsListShowComponent,
    AppsListActionsComponent,
    CheckboxCellComponent,
    FeaturesListEnabledComponent,
    SiteLanguagesComponent,
    SiteLanguagesStatusComponent,
    CreateAppComponent,
    CreateInheritedAppComponent,
    AddAppFromFolderComponent,
    SystemInfoComponent,
    FeaturesListEnabledReasonComponent,
    FeaturesStatusComponent,
    LicenseInfoComponent,
    LicensesOrderPipe,
    AgGridHeightDirective,
    ActiveFeaturesCountPipe,
    FeatureDetailsDialogComponent,
    RegistrationComponent,
  ],
  imports: [
    AppsManagementRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    CommonModule,
    SxcGridModule,
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
    MatBadgeModule,
    FeaturesModule
  ],
  providers: [
    Context,
    AppsListService,
    ZoneService,
    FeaturesConfigService,
    SxcInsightsService,
    DialogService,
    AppDialogConfigService,
    { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
  ],
})
export class AppsManagementModule { }
