import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';
import { EntitiesService } from '../content-items/services/entities.service';
import { MetadataService } from '../permissions';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { MetadataActionsComponent } from './metadata-actions/metadata-actions.component';
import { MetadataContentTypeComponent } from './metadata-content-type/metadata-content-type.component';
import { MetadataRoutingModule } from './metadata-routing.module';
import { MetadataSaveDialogComponent } from './metadata-save-dialog/metadata-save-dialog.component';
import { MetadataComponent } from './metadata.component';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [
    MetadataComponent,
    MetadataActionsComponent,
    MetadataSaveDialogComponent,
    MetadataContentTypeComponent,
    ConfirmDeleteDialogComponent,
  ],
  imports: [
    CommonModule,
    MetadataRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SxcGridModule,
    MatRippleModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    EcoFabSpeedDialModule,
    MatBadgeModule,
  ],
  providers: [
    Context,
    MetadataService,
    EntitiesService,
  ],
})
export class MetadataModule { }
