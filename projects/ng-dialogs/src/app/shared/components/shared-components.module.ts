import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EmptyRouteComponent } from './empty-route/empty-route.component';
import { DialogEntryComponent } from './dialog-entry/dialog-entry.component';
import { DialogService } from './dialog-service/dialog.service';

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
    DialogService,
  ],
  exports: [
    EmptyRouteComponent,
    DialogEntryComponent,
  ]
})
export class SharedComponentsModule { }
