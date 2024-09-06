import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EavLogger } from '../shared/logging/eav-logger';
import { EditReloadComponent } from './routing/edit-reload.component';

const editRefreshRoutes: Routes = [
  {
    path: '',
    component: EditReloadComponent,
    data: { title: 'Reloading Edit Dialog' }
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(editRefreshRoutes),
    EditReloadComponent,
  ],
})
export class RefreshEditModule { }

// IMPORTANT:
// Moved here from edit.routing.ts 2024-09-06 by 2dm
// Because he thinks this refreshing mechanism is not needed anymore.
// but if it is needed, it should possibly be moved back to be with the other similar functions.

const editRouteMatcherSpecs = {
  enabled: true,
  name: 'EditRouteMatchers',
  specs: {},
};
const logger = new EavLogger(editRouteMatcherSpecs);

