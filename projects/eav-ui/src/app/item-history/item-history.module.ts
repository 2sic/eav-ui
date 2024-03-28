import { NgModule } from '@angular/core';
import { Context } from '../shared/services/context';
import { ItemHistoryRoutingModule } from './item-history-routing.module';
@NgModule({
  imports: [
    ItemHistoryRoutingModule,
  ],
  providers: [
    Context,
    // @2dg, no impact of style since angular 16+
    // { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
    // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } }
  ]
})
export class ItemHistoryModule { }
