import { Routes } from '@angular/router';
import { GoToMetadata } from '../metadata';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { importContentItemDialog } from './import-content-item/import-content-item-dialog.config';
import { contentItemsDialog } from './content-items-dialog.config';
import { EditRoutesSubItems } from '../edit/edit.routing';

export const contentItemsRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: contentItemsDialog },
    children: [
      ...GoToMetadata.getRoutes(),
      {
        path: 'export/:contentTypeStaticName',
        loadChildren: () => import('../content-export/content-export.routing').then(m => m.ContentExportRoutes)
      },
      {
        path: 'export/:contentTypeStaticName/:selectedIds',
        loadChildren: () => import('../content-export/content-export.routing').then(m => m.ContentExportRoutes)
      },
      {
        path: 'import',
        component: DialogEntryComponent,
        data: { dialog: importContentItemDialog }
      },
      {
        path: ':contentTypeStaticName/import',
        loadChildren: () => import('../content-import/content-import.routing').then(m => m.contentImportRoutes),
        data: { title: 'Import Items' },
      },
      ...EditRoutesSubItems,
    ]
  },
];

