import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ItemHistoryRoutingModule } from './item-history-routing.module';
import { ItemHistoryComponent } from './item-history.component';

@NgModule({
  declarations: [
    ItemHistoryComponent,
  ],
  entryComponents: [
    ItemHistoryComponent,
  ],
  imports: [
    CommonModule,
    ItemHistoryRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  providers: [
    Context,
  ]
})
export class ItemHistoryModule { }
