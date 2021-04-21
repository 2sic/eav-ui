import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { DevRestApiComponent } from './api/api.component';
import { DevRestDataComponent } from './data/data.component';
import { devRestDialog } from './dev-rest-dialog.config';
import { DevRestQueryComponent } from './query/query.component';
import { GoToDevRest } from './go-to-dev-rest';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: devRestDialog, title: 'REST API' }, children: [
      // New: Moved full responbility of sub-routes to here (2dm 2020-11-23)
      {
        path: `data/:${GoToDevRest.paramTypeName}`, component: DevRestDataComponent, children: [
          GoToPermissions.route,
        ]
      },
      {
        path: `query/:${GoToDevRest.paramQuery}`, component: DevRestQueryComponent, children: [
          GoToPermissions.route,
        ]
      },
      { path: `custom/:${GoToDevRest.paramApiPath}`, component: DevRestApiComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevRestRoutingModule { }
