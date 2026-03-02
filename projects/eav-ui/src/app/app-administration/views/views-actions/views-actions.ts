import { ICellRendererParams } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LightSpeedActions } from "../../../admin-shared/lightspeed-action/lightspeed-action";
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { AgGridActionsDoAndUrlTo } from '../../../shared/ag-grid/ag-grid-actions-signatures';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { View } from '../../models/view.model';

const doVerbs = ['openCode', 'openPermissions', 'exportView', 'deleteView', 'cloneView', 'openMetadata'] as const;

const urlToVerbs = ['openMetadata', 'cloneView', 'openPermissions'] as const;

@Component({
  selector: 'app-views-actions',
  templateUrl: './views-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    TippyDirective,
    LightSpeedActions,
    CommonModule
  ]
})
export class ViewsActionsComponent extends AgGridActionsBaseComponent<
  View,
  typeof doVerbs[number],
  {
    enableCodeGetter(): boolean;
    enablePermissionsGetter(): boolean;
  }
  // also all parameters from LightSpeedActions, since we use that component in our template and need to pass the params down to it
  & ReturnType<LightSpeedActions['params']>
  // also all default params of the do and urlTo methods
  & AgGridActionsDoAndUrlTo<typeof doVerbs[number], typeof urlToVerbs[number], View>
> {
  
  protected view: View;
  enableCode: boolean;
  enablePermissions: boolean;
  isEnabled: boolean;

  agInit(params: ICellRendererParams & ViewsActionsComponent['params']): void {
    super.agInit(params);
    this.view = params.data; // it's already on .data, but because we use it a lot, we prefer to use 'view' here.
    this.enableCode = this.params.enableCodeGetter();
    this.enablePermissions = this.params.enablePermissionsGetter();
    this.isEnabled = !this.view.EditInfo.DisableEdit && this.enablePermissions
  }
}

// export class ViewsActionsComponent extends AgActionsAlwaysRefresh {
//   protected view: View;
//   enableCode: boolean;
//   enablePermissions: boolean;
//   isEnabled: boolean;

//   // public params: ICellRendererParams & ViewActionsParams & {
//   public params: typeofSignal<LightSpeedActions['params']> & {
//     enableCodeGetter(): boolean;
//     enablePermissionsGetter(): boolean;
  
//     do(verb: 'openCode' | 'openPermissions' | 'exportView' | 'deleteView' | 'cloneView' | 'openMetadata', view: View): void;
//     urlTo(verb: 'openMetadata' | 'cloneView' | 'openPermissions', view: View): string;
//   }


//   agInit(params: ICellRendererParams & ViewsActionsComponent['params']): void {
//     this.params = params;
//     this.view = params.data;
//     this.enableCode = this.params.enableCodeGetter();
//     this.enablePermissions = this.params.enablePermissionsGetter();
//     this.isEnabled = !this.view.EditInfo.DisableEdit && this.enablePermissions
//   }
// }
