import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsNavigation } from '../permissions/permissions-navigation';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { DevRestCustomComponent } from './dev-rest-custom/dev-rest-custom.component';
import { DevRestDataComponent } from './dev-rest-data/dev-rest-data.component';
import { devRestDialog } from './dev-rest-dialog.config';
import { DevRestNavigation } from './dev-rest-navigation';
import { DevRestQueryComponent } from './dev-rest-query/dev-rest-query.component';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: devRestDialog, title: 'REST API' }, children: [
      // New: Moved full responbility of sub-routes to here (2dm 2020-11-23)
      {
        path: `data/:${DevRestNavigation.paramTypeName}`, component: DevRestDataComponent, children: [
          PermissionsNavigation.route,
        ]
      },
      {
        path: `query/:${DevRestNavigation.paramQuery}`, component: DevRestQueryComponent, children: [
          PermissionsNavigation.route,
        ]
      },
      { path: `custom/:${DevRestNavigation.paramApiPath}`, component: DevRestCustomComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevRestRoutingModule { }
