import { AgGridModule } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EntitiesService } from '../content-items/services/entities.service';
import { MetadataService } from '../permissions';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { MetadataActionsComponent } from './ag-grid-components/metadata-actions/metadata-actions.component';
import { MetadataRoutingModule } from './metadata-routing.module';
import { MetadataSaveDialogComponent } from './metadata-save-dialog/metadata-save-dialog.component';
import { MetadataComponent } from './metadata.component';

@NgModule({
  declarations: [
    MetadataComponent,
    MetadataActionsComponent,
    MetadataSaveDialogComponent,
  ],
  imports: [
    CommonModule,
    MetadataRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    AgGridModule.withComponents([]),
    MatRippleModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  providers: [
    Context,
    MetadataService,
    EntitiesService,
  ],
})
export class MetadataModule { }
