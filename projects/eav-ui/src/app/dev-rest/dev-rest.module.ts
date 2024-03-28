import { NgModule } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SELECT_CONFIG } from '@angular/material/select';
import { DevRestRoutingModule } from './dev-rest-routing.module';
@NgModule({
    imports: [
      // TODO:: Remove routing module from imports (Standalone)
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
