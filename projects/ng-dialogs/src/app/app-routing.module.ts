import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { editRoot } from '../../../edit/edit.matcher';

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
    path: ':zoneId/:appId/fields',
    loadChildren: () => import('./content-type-fields/content-type-fields.module').then(m => m.ContentTypeFieldsModule)
  },
  {
    matcher: editRoot, // ':zoneId/:appId/edit/:items' or ':zoneId/:appId/edit/:items/details/:expandedFieldId'
    loadChildren: () => import('../../../edit/edit.module').then(m => m.EditModule)
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
