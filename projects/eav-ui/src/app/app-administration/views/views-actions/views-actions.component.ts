import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { View } from '../../models/view.model';
import { ViewActionsParams, ViewActionsType } from './views-actions.models';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../shared/shared-components.module';
import { MatRippleModule } from '@angular/material/core';
import { LightSpeedActionsComponent } from "../../../admin-shared/lightspeed-action/lightspeed-action.component";

@Component({
    selector: 'app-views-actions',
    templateUrl: './views-actions.component.html',
    styleUrls: ['./views-actions.component.scss'],
    standalone: true,
    imports: [
        MatRippleModule,
        SharedComponentsModule,
        MatIconModule,
        MatBadgeModule,
        MatMenuModule,
        LightSpeedActionsComponent
    ]
})
export class ViewsActionsComponent implements ICellRendererAngularComp {
  view: View;
  enableCode: boolean;
  enablePermissions: boolean;
  params: ICellRendererParams & ViewActionsParams;

  agInit(params: ICellRendererParams & ViewActionsParams): void {
    this.params = params;
    this.view = this.params.data;
    this.enableCode = this.params.enableCodeGetter();
    this.enablePermissions = this.params.enablePermissionsGetter();
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: ViewActionsType): void {
    this.params.do(verb, this.view);
  }
}
