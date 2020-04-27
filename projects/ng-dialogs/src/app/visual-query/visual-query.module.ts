import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VisualQueryRoutingModule } from './visual-query-routing.module';
import { VisualQueryComponent } from './visual-query.component';
import { Context } from '../shared/services/context';

@NgModule({
  declarations: [
    VisualQueryComponent,
  ],
  entryComponents: [
    VisualQueryComponent,
  ],
  imports: [
    CommonModule,
    VisualQueryRoutingModule,
  ],
  providers: [
    Context,
  ]
})
export class VisualQueryModule { }
