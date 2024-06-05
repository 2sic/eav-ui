import { NgModule } from '@angular/core';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { PermissionsRoutingModule } from './permissions-routing.module';

@NgModule({
  imports: [
    PermissionsRoutingModule,
    SxcGridModule,
  ],
  providers: [
    Context,
  ]
})
export class PermissionsModule { }
