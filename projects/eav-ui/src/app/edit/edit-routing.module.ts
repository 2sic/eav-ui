import { EnvironmentProviders, NgModule, Provider } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogEntryComponent } from '../shared/components/dialog-entry/dialog-entry.component';
import { editDialog } from './edit-dialog.config';
import { edit, refreshEdit } from './edit.matcher';
import { Context } from '../shared/services/context';
import { EditInitializerService, FormConfigService } from './shared/services';
import { EavLogger } from '../shared/logging/eav-logger';

const logThis = true;
const logger = new EavLogger('EditRoutingModule', logThis);

export const EditProviders: (Provider | EnvironmentProviders)[] = [
  // 2dm - not working yet; needed by be the EditEntryComponent and the EditDialogMainComponent
  Context,              // Form context, such as what app etc. - the same for the entire form
  FormConfigService,    // form configuration valid for this entire form; will be initialized by the EditInitializerService
];

export const EditRoutes: Routes = [
  {
    path: '',
    // todo: should consider creating an own EditDialogEntryComponent
    // which would directly get the edit dialog (not through this indirection)
    // and would provide the services needed by the edit dialog.
    component: DialogEntryComponent,
    // note: it seems that the edit-dialog - which is created here,
    // needs some services which must be provided in a hierarchy above this point.
    // so adding providers here would not suffice.
    data: { dialog: editDialog },
    children: [
      {
        matcher: edit,
        loadChildren: () => {
          logger.a('loadChildren - matcher: edit');
          return import('./edit.module').then(m => m.EditModule);
        },
      },
      {
        matcher: refreshEdit,
        loadChildren: () => import('./refresh-edit.module').then(m => m.RefreshEditModule)
      },
      {
        path: 'versions/:itemId',
        loadChildren: () => import('../item-history/item-history.routing').then(m => m.historyRoutes),
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(EditRoutes)],
  exports: [RouterModule],
  providers: EditProviders
})
export class EditRoutingModule { }
