import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { EntitiesService } from '../content-items/services/entities.service';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { PermissionsActionsComponent } from './permissions-actions/permissions-actions.component';
import { PermissionsRoutingModule } from './permissions-routing.module';
import { PermissionsComponent } from './permissions.component';
import { MetadataService } from './services/metadata.service';
import { PermissionsService } from './services/permissions.service';

@NgModule({
  declarations: [
    PermissionsComponent,
    PermissionsActionsComponent,
  ],
  imports: [
    CommonModule,
    PermissionsRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SxcGridModule,
    MatRippleModule,
    MatSnackBarModule,
  ],
  providers: [
    Context,
    PermissionsService,
    MetadataService,
    EntitiesService,
  ]
})
export class PermissionsModule { }
