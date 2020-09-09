import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { App } from '../../models/app.model';
import { AppsListActionsParams } from './apps-list-actions.models';

@Component({
  selector: 'app-apps-list-actions',
  templateUrl: './apps-list-actions.component.html',
  styleUrls: ['./apps-list-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppsListActionsComponent implements ICellRendererAngularComp {
  app: App;
  private params: AppsListActionsParams;

  agInit(params: AppsListActionsParams) {
    this.params = params;
    this.app = this.params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  deleteApp() {
    this.params.onDelete(this.app);
  }

  flushCache() {
    this.params.onFlush(this.app);
  }
}
