import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ItemHistoryRoutingModule } from './item-history-routing.module';
import { ItemHistoryComponent } from './item-history.component';
import { VersionsService } from './services/versions.service';

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
    MatExpansionModule,
    MatSnackBarModule,
    MatPaginatorModule,
  ],
  providers: [
    Context,
    VersionsService,
  ]
})
export class ItemHistoryModule { }
