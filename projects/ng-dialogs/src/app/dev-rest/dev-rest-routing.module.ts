import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { DevRestCustomComponent } from './dev-rest-custom/dev-rest-custom.component';
import { DevRestDataComponent } from './dev-rest-data/dev-rest-data.component';
import { devRestDialog } from './dev-rest-dialog.config';
import { DevRestQueryComponent } from './dev-rest-query/dev-rest-query.component';
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
      { path: `custom/:${GoToDevRest.paramApiPath}`, component: DevRestCustomComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevRestRoutingModule { }
