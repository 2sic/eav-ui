import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { App } from '../../models/app.model';
import { AppsListActionsParams } from './apps-list-actions.models';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../shared/shared-components.module';

@Component({
  selector: 'app-apps-list-actions',
  templateUrl: './apps-list-actions.component.html',
  styleUrls: ['./apps-list-actions.component.scss'],
  standalone: true,
  imports: [
    SharedComponentsModule,
    MatIconModule,
    MatBadgeModule,
    MatRippleModule,
    MatMenuModule,
  ],
})
export class AppsListActionsComponent implements ICellRendererAngularComp {
  app: App;

  public params: ICellRendererParams & AppsListActionsParams;
  public lightspeedEnabled: boolean;
  public appHasLightSpeed: boolean;
  public appLightSpeedEnabled: boolean;

  agInit(params: ICellRendererParams & AppsListActionsParams): void {
    this.params = params;
    this.app = this.params.data;
    this.lightspeedEnabled = this.params.lightspeedEnabled();
    this.appHasLightSpeed = this.app.Lightspeed?.Id != null;
    this.appLightSpeedEnabled = this.app.Lightspeed?.IsEnabled == true;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openLightspeed(): void {
    this.params.onOpenLightspeed(this.app);
  }

  openLightspeedFeatureInfo(): void {
    this.params.openLightspeedFeatureInfo();
  }

  flushCache(): void {
    this.params.onFlush(this.app);
  }

  deleteApp(): void {
    this.params.onDelete(this.app);
  }
}
