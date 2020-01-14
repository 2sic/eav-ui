import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EmptyRouteComponent } from './empty-route/empty-route.component';
import { DialogEntryComponent } from './dialog-entry/dialog-entry.component';

@NgModule({
  declarations: [
    EmptyRouteComponent,
    DialogEntryComponent,
  ],
  entryComponents: [
  ],
  imports: [
    RouterModule,
  ],
  providers: [
  ],
  exports: [
    EmptyRouteComponent,
    DialogEntryComponent,
  ]
})
export class SharedComponentsModule { }
