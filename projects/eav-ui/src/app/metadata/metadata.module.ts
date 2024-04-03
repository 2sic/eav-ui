import { NgModule } from '@angular/core';
// import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MetadataRoutingModule } from './metadata-routing.module';
import { Context } from '../shared/services/context';
import { FeatureDetailService } from '../features/services/feature-detail.service';
@NgModule({
  imports: [
    MetadataRoutingModule,
  ],
  providers: [
    // Is use in the top level of Compontent tree
    Context,
    // @2dg, no impact of style since angular 16+
    // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    // { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
    // @2dg Check, if this is needed
    // { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
    //
  ],
})
export class MetadataModule { }
