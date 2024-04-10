import { NgModule } from '@angular/core';
import { EntitiesService } from '../content-items/services/entities.service';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { PermissionsRoutingModule } from './permissions-routing.module';
import { PermissionsComponent } from './permissions.component';
import { MetadataService } from './services/metadata.service';
import { PermissionsService } from './services/permissions.service';

@NgModule({
  imports: [
    PermissionsRoutingModule,
    SxcGridModule,
    PermissionsComponent,
    // PermissionsActionsComponent,
  ],
  providers: [
    Context,
    PermissionsService,
    MetadataService,
    EntitiesService,
  ]
})
export class PermissionsModule { }
