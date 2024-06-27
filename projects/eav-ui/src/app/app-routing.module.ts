import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { editRoot, refreshEditRoot } from './edit/edit.matcher';

const appRoutes: Routes = [
  {
    path: ':zoneId/apps',
    loadChildren: () => import('./apps-management/apps-management.module').then(m => m.AppsManagementModule),
    data: { title: 'Apps' },
  },
  {
    path: ':zoneId/import',
    loadChildren: () => import('./import-app/import-app-routing.module').then(m => m.importRoutes),
    data: { title: 'Import App' },
  },
  {
    path: ':zoneId/:appId/app',
    loadChildren: () => import('./app-administration/app-administration.module').then(m => m.AppAdministrationModule),
    data: { title: 'App' },
  },
  {
    path: ':zoneId/:appId/code',
    loadChildren: () => import('./code-editor/code-editor.module').then(m => m.CodeEditorModule),
    data: { title: 'Code Editor' },
  },
  {
    path: ':zoneId/:appId/query/:pipelineId',
    // loadChildren: () => import('./visual-query/visual-query-routing.module').then(m => m.visualQueryRoutes),
    loadChildren: () => import('./visual-query/visual-query.module').then(m => m.VisualQueryModule),
    data: { title: 'Visual Query' },
  },
  {
    path: ':zoneId/:appId/:guid/:part/:index/replace',
    loadChildren: () => import('./replace-content/replace-content-routing.module').then(m => m.replaceContentRoutes),

    data: { title: 'Apps' },
  },
  {
    path: ':zoneId/:appId/:guid/:part/:index/reorder',
    loadChildren: () => import('./manage-content-list/manage-content-list.module').then(m => m.ManageContentListModule),
    data: { title: 'Reorder Items' },
  },
  {
    path: ':zoneId/:appId/items/:contentTypeStaticName',
    loadChildren: () => import('./content-items/content-items.module').then(m => m.ContentItemsModule),
    data: { title: 'Items' },
  },
  {
    path: ':zoneId/:appId/fields/:contentTypeStaticName',
    loadChildren: () => import('./content-type-fields/content-type-fields.module').then(m => m.ContentTypeFieldsModule),
    data: { title: 'Fields' },
  },
  {
    path: ':zoneId/:appId/versions/:itemId',
    loadChildren: () => import('./item-history/item-history-routing.module').then(m => m.historyRoutes),
  },
  {
    matcher: editRoot,
    loadChildren: () => import('./edit/edit.module').then(m => m.EditModule),
    data: { title: 'Edit Item' },
  },
  {
    matcher: refreshEditRoot,
    loadChildren: () => import('./edit/refresh-edit.module').then(m => m.RefreshEditModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
