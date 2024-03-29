import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MAT_SELECT_CONFIG, MatSelectModule } from '@angular/material/select';
import { MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
import { MatCardModule } from '@angular/material/card';

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
    MatCardModule,
  ],
  providers: [
    Context,
    MetadataService,
    EntitiesService,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
    { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
  ],
})
export class MetadataModule { }
