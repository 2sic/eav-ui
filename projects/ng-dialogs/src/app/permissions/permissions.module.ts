import { AgGridModule } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EntitiesService } from '../content-items/services/entities.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { PermissionsActionsComponent } from './ag-grid-components/permissions-actions/permissions-actions.component';
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
    AgGridModule.withComponents([]),
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
