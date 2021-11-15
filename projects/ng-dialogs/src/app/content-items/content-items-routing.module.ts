import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { edit, refreshEdit } from '../../../../edit/edit.matcher';
import { GoToMetadata } from '../metadata';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { contentItemImportDialog } from './content-item-import/content-item-import-dialog.config';
import { contentItemsDialog } from './content-items-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: contentItemsDialog }, children: [
      ...GoToMetadata.getRoutes(),
      {
        path: 'export/:contentTypeStaticName',
        loadChildren: () => import('../content-export/content-export.module').then(m => m.ContentExportModule)
      },
      {
        path: 'export/:contentTypeStaticName/:selectedIds',
        loadChildren: () => import('../content-export/content-export.module').then(m => m.ContentExportModule)
      },
      { path: 'import', component: DialogEntryComponent, data: { dialog: contentItemImportDialog } },
      {
        path: ':contentTypeStaticName/import',
        loadChildren: () => import('../content-import/content-import.module').then(m => m.ContentImportModule),
        data: { title: 'Import Items' },
      },
      {
        matcher: edit,
        loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
      },
      {
        matcher: refreshEdit,
        loadChildren: () => import('../../../../edit/refresh-edit.module').then(m => m.RefreshEditModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentItemsRoutingModule { }
