import { NgModule } from '@angular/core';
import { Context } from '../shared/services/context';
import { AppsManagementRoutingModule } from './apps-management-routing.module';
@NgModule({
    imports: [
        AppsManagementRoutingModule,
    ],
    providers: [
        // Is use in the top level of Component tree
        Context,
        // @2dg, no impact of style since angular 16+
        // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
        // { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
    ],
})
export class AppsManagementModule { }
