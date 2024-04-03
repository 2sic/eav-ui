import { NgModule } from '@angular/core';
import { Context } from '../shared/services/context';
import { ReplaceContentRoutingModule } from './replace-content-routing.module';

@NgModule({
  imports: [
    ReplaceContentRoutingModule,
  ],
  providers: [
    Context,
    // @2dg, no impact of style since angular 16+
    // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    // @2dg Check, if this is needed
    // { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
  ]
})
export class ReplaceContentModule { }
