import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    CommonModule,
  ],
  providers: [
  ],
  exports: [
    EmptyRouteComponent,
    DialogEntryComponent,
  ]
})
export class SharedComponentsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedComponentsModule,
      providers: [DialogService]
    };
  }
}
