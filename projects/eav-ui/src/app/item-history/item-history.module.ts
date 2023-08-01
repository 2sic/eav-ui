import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ItemHistoryRoutingModule } from './item-history-routing.module';
import { ItemHistoryComponent } from './item-history.component';
import { VersionsService } from './services/versions.service';

@NgModule({
  declarations: [
    ItemHistoryComponent,
  ],
  imports: [
    CommonModule,
    ItemHistoryRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule,
  ],
  providers: [
    Context,
    VersionsService,
  ]
})
export class ItemHistoryModule { }
