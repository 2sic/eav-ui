import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { App } from '../../models/app.model';
import { AppsListActionsParams } from './apps-list-actions.models';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { LightSpeedActionsComponent } from '../../../admin-shared/lightspeed-action/lightspeed-action.component';
import { TippyStandaloneDirective } from '../../../shared/directives/tippy-Standalone.directive';

@Component({
  selector: 'app-apps-list-actions',
  templateUrl: './apps-list-actions.component.html',
  standalone: true,
  imports: [
    TippyStandaloneDirective,
    MatIconModule,
    MatBadgeModule,
    MatRippleModule,
    MatMenuModule,
    LightSpeedActionsComponent,
  ],
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

  flushCache(): void {
    this.params.onFlush(this.app);
  }

  deleteApp(): void {
    this.params.onDelete(this.app);
  }
}
