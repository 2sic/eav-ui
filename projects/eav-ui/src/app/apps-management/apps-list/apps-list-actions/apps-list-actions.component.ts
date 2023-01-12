import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { App } from '../../models/app.model';
import { AppsListActionsParams } from './apps-list-actions.models';

@Component({
  selector: 'app-apps-list-actions',
  templateUrl: './apps-list-actions.component.html',
  styleUrls: ['./apps-list-actions.component.scss'],
})
export class AppsListActionsComponent implements ICellRendererAngularComp {
  app: App;

  public params: ICellRendererParams & AppsListActionsParams;

  agInit(params: ICellRendererParams & AppsListActionsParams): void {
    this.params = params;
    this.app = this.params.data;
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
