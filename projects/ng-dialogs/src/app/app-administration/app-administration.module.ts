import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

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

// TODO: spm - put into own file
const routes: Routes = [
  {
    path: '', component: AppAdministrationEntryComponent, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: AppAdministrationTabPickerComponent },
      { path: 'data', component: AppAdministrationTabPickerComponent },
      { path: 'queries', component: AppAdministrationTabPickerComponent },
      { path: 'views', component: AppAdministrationTabPickerComponent },
      { path: 'web-api', component: AppAdministrationTabPickerComponent },
      { path: 'app', component: AppAdministrationTabPickerComponent },
      { path: 'global', component: AppAdministrationTabPickerComponent },
    ]
  },
];

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
    AppAdministrationNavComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ],
  providers: [
    AppAdministrationParamsService,
    Context,
  ]
})
export class AppAdministrationModule { }
