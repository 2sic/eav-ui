import { ICellRendererParams } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LightSpeedActions } from "../../../admin-shared/lightspeed-action/lightspeed-action";
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { typeofSignal } from '../../../shared/signals/typeof-signal';
import { View } from '../../models/view.model';
import { AgActionsAlwaysRefresh } from '../../queries/ag-actions/ag-actions';


@Component({
  selector: 'app-views-actions',
  templateUrl: './views-actions.component.html',
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
export class ViewsActionsComponent extends AgActionsAlwaysRefresh {
  protected view: View;
  enableCode: boolean;
  enablePermissions: boolean;
  isEnabled: boolean;

  // public params: ICellRendererParams & ViewActionsParams & {
  public params: typeofSignal<LightSpeedActions['params']> & {
    enableCodeGetter(): boolean;
    enablePermissionsGetter(): boolean;
  
    do(verb: 'openCode' | 'openPermissions' | 'exportView' | 'deleteView' | 'cloneView' | 'openMetadata', view: View): void;
    urlTo(verb: 'openMetadata' | 'cloneView' | 'openPermissions', view: View): string;
  }


  agInit(params: ICellRendererParams & ViewsActionsComponent['params']): void {
    this.params = params;
    this.view = params.data;
    this.enableCode = this.params.enableCodeGetter();
    this.enablePermissions = this.params.enablePermissionsGetter();
    this.isEnabled = !this.view.EditInfo.DisableEdit && this.enablePermissions
  }
}
