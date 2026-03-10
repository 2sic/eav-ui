import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LightSpeedActions } from '../../../admin-shared/lightspeed-action/lightspeed-action';
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { App } from '../../models/app.model';

@Component({
  selector: 'app-apps-list-actions',
  templateUrl: './apps-list-actions.html',
  imports: [
    TippyDirective,
    MatIconModule,
    MatBadgeModule,
    MatRippleModule,
    MatMenuModule,
    LightSpeedActions,
  ],
})
export class AppsListActionsComponent extends AgGridActionsBaseComponent<App, AppsListActionsVerb> {
  declare params: AppsListActionsParams;

  get app(): App {
    return this.data;
  }
}

export type AppsListActionsVerb = 'deleteApp' | 'flushCache';

export interface AppsListActionsParams {
  lightSpeedLink(app: App): string;
  openLightspeedFeatureInfo(): void;
  do(verb: AppsListActionsVerb, app: App): void;
}