import { NgModule } from '@angular/core';
import { DevRestRoutingModule } from './dev-rest-routing.module';
@NgModule({
    imports: [
      DevRestRoutingModule
    ],
    providers: [
      // @2dg, no impact of style since angular 16+
        // { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },

        // @2dg, dev-rest not use Icon in a select
        // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } }
    ],
})
export class DevRestModule { }
