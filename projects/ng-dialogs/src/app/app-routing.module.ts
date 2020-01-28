import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const appRoutes: Routes = [
  {
    path: ':zoneId/apps',
    loadChildren: () => import('./apps-management/apps-management.module').then(m => m.AppsManagementModule)
  },
  {
    path: ':zoneId/:appId/app',
    loadChildren: () => import('./app-administration/app-administration.module').then(m => m.AppAdministrationModule)
  },
  {
    path: ':zoneId/:appId/code',
    loadChildren: () => import('./code-editor/code-editor.module').then(m => m.CodeEditorModule)
  },
  {
    path: ':zoneId/:appId/edit',
    loadChildren: () => import('../../../edit/src/app/app.module').then(m => m.AppModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppRoutingModule { }
