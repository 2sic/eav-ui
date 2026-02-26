import { Routes } from '@angular/router';
import { EditRoutes } from '../edit/edit.routing';
import { featureInfoRouteDialog } from '../features/dialogs/feature-info-dialog-route.config';
import { GoToMetadata } from '../metadata';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry';
import { contentItemsDialog } from './content-items-dialog.config';
import { importContentItemDialog } from './import-content-item/import-content-item-dialog.config';
import { relationshipsDialog } from './relationships/relationships-dialog.config';

export const contentItemsRoutes: Routes = [
  {
    path: '',
    component: DialogEntryComponent,
    data: { dialog: contentItemsDialog },
    children: [
      ...GoToMetadata.getRoutes(),
      {
        path: 'export/:contentTypeStaticName',
        loadChildren: () => import('../content-export/content-export.routing')
          .then(m => m.ContentExportRoutes)
      },
      {
        path: 'export/:contentTypeStaticName/:selectedIds',
        loadChildren: () => import('../content-export/content-export.routing')
          .then(m => m.ContentExportRoutes)
      },
      {
        path: 'import',
        component: DialogEntryComponent,
        data: { dialog: importContentItemDialog }
      },
      {
        path: ':contentTypeStaticName/import',
        loadChildren: () => import('../content-import/content-import.routing')
          .then(m => m.contentImportRoutes),
        data: { title: 'Import Items' },
      },
      {
        path: 'relationships/:itemId',
        component: DialogEntryComponent,
        data: { dialog: relationshipsDialog },
        children: [
          ...EditRoutes,
          {
            path: 'features/details/:featureId',
            component: DialogEntryComponent,
            data: { dialog: featureInfoRouteDialog },
          },
        ],
      },
      ...EditRoutes,
    ]
  },
];

