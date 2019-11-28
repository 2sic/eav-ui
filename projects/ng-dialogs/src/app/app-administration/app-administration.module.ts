import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AppAdministrationNavigationComponent } from './app-administration-navigation/app-administration-navigation.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { DataComponent } from './data/data.component';
import { QueriesComponent } from './queries/queries.component';
import { ViewsComponent } from './views/views.component';
import { WebApiComponent } from './web-api/web-api.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { GlobalSettingsComponent } from './global-settings/global-settings.component';
import { AppAdministrationEntryComponent } from './app-administration-entry/app-administration-entry.component';
import { AppAdministrationHostTabPickerComponent } from './app-administration-host-tab-picker/app-administration-host-tab-picker.component';
import { AppAdministrationParamsService } from './shared/services/app-administration-params.service';
import { Context } from '../shared/context/context';

// TODO: spm - put into own file
const routes: Routes = [
  {
    path: '', component: AppAdministrationEntryComponent, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: AppAdministrationHostTabPickerComponent },
      { path: 'data', component: AppAdministrationHostTabPickerComponent },
      { path: 'queries', component: AppAdministrationHostTabPickerComponent },
      { path: 'views', component: AppAdministrationHostTabPickerComponent },
      { path: 'web-api', component: AppAdministrationHostTabPickerComponent },
      { path: 'app', component: AppAdministrationHostTabPickerComponent },
      { path: 'global', component: AppAdministrationHostTabPickerComponent },
    ]
  },
];

@NgModule({
  declarations: [
    GettingStartedComponent,
    AppAdministrationNavigationComponent,
    DataComponent,
    QueriesComponent,
    ViewsComponent,
    WebApiComponent,
    AppConfigurationComponent,
    GlobalSettingsComponent,
    AppAdministrationEntryComponent,
    AppAdministrationHostTabPickerComponent
  ],
  entryComponents: [
    AppAdministrationNavigationComponent
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
