import { NgModule } from '@angular/core';
import { MAT_SELECT_CONFIG } from '@angular/material/select';
import { Context } from '../shared/services/context';
import { ContentExportRoutingModule } from './content-export-routing.module';
@NgModule({
    imports: [
        ContentExportRoutingModule,
    ],
    providers: [
        Context,
        // @2dg, no impact of style since angular 16+
        // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } }
    ]
})
export class ContentExportModule { }
