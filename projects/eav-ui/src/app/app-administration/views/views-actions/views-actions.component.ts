import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LightSpeedActionsComponent } from "../../../admin-shared/lightspeed-action/lightspeed-action.component";
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { View } from '../../models/view.model';
import { ViewActionsParams, ViewActionsType } from './views-actions.models';

type GoToUrls = 'openMetadata' | 'cloneView' | 'openPermissions';

@Component({
  selector: 'app-views-actions',
  templateUrl: './views-actions.component.html',
  standalone: true,
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    TippyDirective,
    LightSpeedActionsComponent,
    CommonModule
  ]
})
export class ViewsActionsComponent implements ICellRendererAngularComp {
  protected view: View;
  enableCode: boolean;
  enablePermissions: boolean;
  isEnabled: boolean;

  public params: ICellRendererParams & ViewActionsParams & {
    urlTo(verb: GoToUrls, view: View): string;
  };

  agInit(params: ICellRendererParams & ViewsActionsComponent['params']): void {
    this.params = params;
    this.view = this.params.data;
    this.enableCode = this.params.enableCodeGetter();
    this.enablePermissions = this.params.enablePermissionsGetter();
    this.isEnabled = !this.view.EditInfo.DisableEdit && this.enablePermissions
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: ViewActionsType): void {
    this.params.do(verb, this.view);
  }
}
