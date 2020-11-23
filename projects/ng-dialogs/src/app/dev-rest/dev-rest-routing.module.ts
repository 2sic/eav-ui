import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { DevRestDataComponent } from './dev-rest-data/dev-rest-data.component';
import { devRestDialog } from './dev-rest-dialog.config';
import { DevRestQueryComponent } from './dev-rest-query/dev-rest-query.component';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: devRestDialog, title: 'REST API' }, children: [
      {
        path: 'data', component: DevRestDataComponent, children: [
          {
            path: 'permissions/:type/:keyType/:key',
            loadChildren: () => import('../permissions/permissions.module').then(m => m.PermissionsModule),
            data: { title: 'Permission' },
          },
        ]
      },
      {
        path: 'query', component: DevRestQueryComponent, children: [
          {
            path: 'permissions/:type/:keyType/:key',
            loadChildren: () => import('../permissions/permissions.module').then(m => m.PermissionsModule),
            data: { title: 'Permission' },
          },
        ]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevRestRoutingModule { }
