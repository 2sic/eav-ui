import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// material components
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    AppAdministrationTabPickerComponent
  ],
  entryComponents: [
    AppAdministrationNavComponent,
  ],
  imports: [
    AppAdministrationRoutingModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [
    AppAdministrationParamsService,
    Context,
  ]
})
export class AppAdministrationModule { }
