import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { DevRestApiComponent } from './api/api.component';
import { devRestDialog } from './dev-rest-dialog.config';
import { GoToDevRest } from './go-to-dev-rest';
import { DevRestQueryComponent } from './query/query.component';

const routes: Routes = [
  {
    path: '', component: DialogEntryComponent, data: { dialog: devRestDialog, title: 'REST API' }, children: [
      // 2dm 2024-03-19 should not be used any more, as now a primary route in /app
      // {
      //   path: `data/:${GoToDevRest.paramTypeName}`, component: DevRestDataComponent, children: [
      //     GoToPermissions.route,
      //   ]
      // },
      /* This route is used in Visual Query to open REST as Dialog */
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
