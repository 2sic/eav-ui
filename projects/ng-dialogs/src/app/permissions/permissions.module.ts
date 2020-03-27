import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgGridModule } from '@ag-grid-community/angular';

import { PermissionsRoutingModule } from './permissions-routing.module';
import { PermissionsComponent } from './permissions.component';
import { PermissionsActionsComponent } from './permissions-actions/permissions-actions.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { Context } from '../shared/context/context';
import { PermissionsService } from '../app-administration/shared/services/permissions.service';
import { MetadataService } from '../app-administration/shared/services/metadata.service';
import { EntitiesService } from '../app-administration/shared/services/entities.service';

@NgModule({
  declarations: [
    PermissionsComponent,
    PermissionsActionsComponent,
  ],
  entryComponents: [
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
    MatTooltipModule,
    AgGridModule.withComponents([]),
  ],
  providers: [
    Context,
    PermissionsService,
    MetadataService,
    EntitiesService,
  ]
})
export class PermissionsModule { }
