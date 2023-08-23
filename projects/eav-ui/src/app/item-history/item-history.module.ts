import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } }
  ]
})
export class ItemHistoryModule { }
