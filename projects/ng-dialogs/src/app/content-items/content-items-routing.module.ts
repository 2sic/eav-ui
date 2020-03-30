import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { CONTENT_ITEMS_DIALOG, IMPORT_CONTENT_ITEM_DIALOG } from '../shared/constants/dialog-names';
import { contentItemsDialogConfig } from './content-items-dialog.config';
import { edit } from '../../../../edit/edit.matcher';
import { contentItemImportDialogConfig } from './ag-grid-components/content-item-import/content-item-import-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: CONTENT_ITEMS_DIALOG, dialogConfig: contentItemsDialogConfig
    }, children: [
      {
        path: 'export/:contentTypeStaticName',
        loadChildren: () => import('../content-export/content-export.module').then(m => m.ContentExportModule)
      },
      {
        path: 'export/:contentTypeStaticName/:selectedIds',
        loadChildren: () => import('../content-export/content-export.module').then(m => m.ContentExportModule)
      },
      {
        path: 'import', component: DialogEntryComponent, data: {
          dialogName: IMPORT_CONTENT_ITEM_DIALOG, dialogConfig: contentItemImportDialogConfig
        }
      },
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
