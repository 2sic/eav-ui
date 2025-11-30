import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LightSpeedActions } from '../../../admin-shared/lightspeed-action/lightspeed-action';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { typeofSignal } from '../../../shared/signals/typeof-signal';
import { App } from '../../models/app.model';

@Component({
  selector: 'app-apps-list-actions',
  templateUrl: './apps-list-actions.component.html',
  imports: [
    TippyDirective,
    MatIconModule,
    MatBadgeModule,
    MatRippleModule,
    MatMenuModule,
    LightSpeedActions,
  ]
})
export class AppsListActions implements ICellRendererAngularComp {
  app: App;

  public params: typeofSignal<LightSpeedActions['params']> & {
    do(verb: 'deleteApp' | 'flushCache', app: App): void;
  }

  agInit(params: ICellRendererParams & AppsListActions['params']): void {
    this.params = params;
    this.app = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: Parameters<typeof this.params.do>[0]): void {
    this.params.do(verb, this.app);
  }
}
