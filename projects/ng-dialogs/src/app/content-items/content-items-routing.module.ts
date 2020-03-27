import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { CONTENT_ITEMS_DIALOG, EXPORT_CONTENT_TYPE_DIALOG, IMPORT_CONTENT_ITEM_DIALOG } from '../shared/constants/dialog-names';
import { contentItemsDialogConfig } from './content-items-dialog.config';
import { edit } from '../../../../edit/edit.matcher';
import { contentExportDialogConfig } from './content-export/content-export-dialog.config';
import { contentItemImportDialogConfig } from './content-item-import/content-item-import-dialog.config';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: {
      dialogName: CONTENT_ITEMS_DIALOG, dialogConfig: contentItemsDialogConfig
    }, children: [
      {
        path: ':contentTypeStaticName/export', component: DialogEntryComponent, data: {
          dialogName: EXPORT_CONTENT_TYPE_DIALOG, dialogConfig: contentExportDialogConfig
        }
      },
      {
        path: ':contentTypeStaticName/export/:selectedIds', component: DialogEntryComponent, data: {
          dialogName: EXPORT_CONTENT_TYPE_DIALOG, dialogConfig: contentExportDialogConfig
        }
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
