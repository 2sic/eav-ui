import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from '@ag-grid-community/angular';

// material components
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppAdministrationNavComponent } from './app-administration-nav/app-administration-nav.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { DataComponent } from './data/data.component';
import { QueriesComponent } from './queries/queries.component';
import { ViewsComponent } from './views/views.component';
import { WebApiComponent } from './web-api/web-api.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { GlobalSettingsComponent } from './global-settings/global-settings.component';
import { AppAdministrationEntryComponent } from './app-administration-entry/app-administration-entry.component';
import { AppAdministrationTabPickerComponent } from './app-administration-tab-picker/app-administration-tab-picker.component';
import { AppAdministrationParamsService } from './shared/services/app-administration-params.service';
import { Context } from '../shared/context/context';
import { AppAdministrationRoutingModule } from './app-administration-routing.module';
import { DataNameComponent } from './shared/ag-grid-components/data-name/data-name.component';
import { DataFieldsComponent } from './shared/ag-grid-components/data-fields/data-fields.component';
import { DataActionsComponent } from './shared/ag-grid-components/data-actions/data-actions.component';
import { QueriesDescriptionComponent } from './shared/ag-grid-components/queries-description/queries-description.component';
import { ViewsShowComponent } from './shared/ag-grid-components/views-show/views-show.component';
import { ViewsActionsComponent } from './shared/ag-grid-components/views-actions/views-actions.component';

@NgModule({
  declarations: [
    GettingStartedComponent,
    AppAdministrationNavComponent,
    DataComponent,
    QueriesComponent,
    ViewsComponent,
    WebApiComponent,
    AppConfigurationComponent,
    GlobalSettingsComponent,
    AppAdministrationEntryComponent,
    AppAdministrationTabPickerComponent,
    DataNameComponent,
    DataFieldsComponent,
    DataActionsComponent,
    QueriesDescriptionComponent,
    ViewsShowComponent,
    ViewsActionsComponent,
  ],
  entryComponents: [
    AppAdministrationNavComponent,
    DataNameComponent,
    DataFieldsComponent,
    DataActionsComponent,
    QueriesDescriptionComponent,
    ViewsShowComponent,
    ViewsActionsComponent,
  ],
  imports: [
    AppAdministrationRoutingModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AgGridModule.withComponents([]),
  ],
  providers: [
    AppAdministrationParamsService,
    Context,
  ]
})
export class AppAdministrationModule { }
