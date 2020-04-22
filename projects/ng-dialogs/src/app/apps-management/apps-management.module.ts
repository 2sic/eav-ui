import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';

import { AppsManagementRoutingModule } from './apps-management-routing.module';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { AppsManagementNavComponent } from './apps-management-nav/apps-management-nav.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { ImportAppComponent } from './shared/modals/import-app/import-app.component';
import { ManageFeaturesComponent } from './manage-features/manage-features.component';
import { SxcInsightsComponent } from './sxc-insights/sxc-insights.component';
import { Context } from '../shared/context/context';
import { AppsListShowComponent } from './shared/ag-grid-components/apps-list-show/apps-list-show.component';
import { AppsListActionsComponent } from './shared/ag-grid-components/apps-list-actions/apps-list-actions.component';
import { AppsListService } from './shared/services/apps-list.service';
import { FeaturesListEnabledComponent } from './shared/ag-grid-components/features-list-enabled/features-list-enabled.component';
import { FeaturesListUiComponent } from './shared/ag-grid-components/features-list-ui/features-list-ui.component';
import { FeaturesListPublicComponent } from './shared/ag-grid-components/features-list-public/features-list-public.component';
import { FeaturesListSecurityComponent } from './shared/ag-grid-components/features-list-security/features-list-security.component';
import { ImportAppService } from './shared/services/import-app.service';
import { EnableLanguagesComponent } from './enable-languages/enable-languages.component';
import { EnableLanguagesService } from './shared/services/enable-languages.service';
import { EnableLanguagesStatusComponent } from './shared/ag-grid-components/enable-languages-status/enable-languages-status.component';
import { FeaturesConfigService } from './shared/services/features-config.service';
import { SxcInsightsService } from './shared/services/sxc-insights.service';

@NgModule({
  declarations: [
    AppsManagementNavComponent,
    AppsListComponent,
    ImportAppComponent,
    ManageFeaturesComponent,
    SxcInsightsComponent,
    AppsListShowComponent,
    AppsListActionsComponent,
    FeaturesListEnabledComponent,
    FeaturesListUiComponent,
    FeaturesListPublicComponent,
    FeaturesListSecurityComponent,
    EnableLanguagesComponent,
    EnableLanguagesStatusComponent,
  ],
  entryComponents: [
    AppsManagementNavComponent,
    ImportAppComponent,
    AppsListShowComponent,
    AppsListActionsComponent,
    FeaturesListEnabledComponent,
    FeaturesListUiComponent,
    FeaturesListPublicComponent,
    FeaturesListSecurityComponent,
    EnableLanguagesStatusComponent,
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
    MatTooltipModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatRippleModule,
    EcoFabSpeedDialModule,
    MatCardModule,
    FormsModule,
    MatInputModule,
  ],
  providers: [
    Context,
    AppsListService,
    EnableLanguagesService,
    ImportAppService,
    FeaturesConfigService,
    SxcInsightsService,
  ]
})
export class AppsManagementModule { }
