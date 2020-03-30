import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { contentItemsDialog } from './content-items-dialog.config';
import { edit } from '../../../../edit/edit.matcher';
import { contentItemImportDialog } from './ag-grid-components/content-item-import/content-item-import-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: contentItemsDialog }, children: [
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
        matcher: edit,
        loadChildren: () => import('../../../../edit/edit.module').then(m => m.EditModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentItemsRoutingModule { }
