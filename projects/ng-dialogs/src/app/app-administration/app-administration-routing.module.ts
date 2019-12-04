import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppAdministrationEntryComponent } from './app-administration-entry/app-administration-entry.component';
import { AppAdministrationTabPickerComponent } from './app-administration-tab-picker/app-administration-tab-picker.component';

const appAdministrationRoutes: Routes = [
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
  imports: [
    RouterModule.forChild(appAdministrationRoutes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppAdministrationRoutingModule { }
