import { NgModule } from '@angular/core';
import { MAT_SELECT_CONFIG} from '@angular/material/select';
import { MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS } from '@angular/material/slide-toggle';
import { Context } from '../shared/services/context';
import { AppsManagementRoutingModule } from './apps-management-routing.module';
import { AgGridAngular } from '@ag-grid-community/angular/lib/ag-grid-angular.component';
import { FeaturesConfigService } from './services/features-config.service';
@NgModule({
    imports: [
        AppsManagementRoutingModule,
    ],
    providers: [
        // Is use in the top level of Compontent tree
        Context,
        // AppsListService,
        // ZoneService,
        // FeaturesConfigService,
        // SxcInsightsService,
        // DialogService,
        // AppDialogConfigService,
        { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
        { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
    ],
})
export class AppsManagementModule { }
