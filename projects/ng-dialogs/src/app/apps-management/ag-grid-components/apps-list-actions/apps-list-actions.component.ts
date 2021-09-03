import { ICellRendererAngularComp } from '@ag-grid-community/angular';
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
  private params: AppsListActionsParams;

  constructor() { }

  agInit(params: AppsListActionsParams) {
    this.params = params;
    this.app = this.params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  flushCache() {
    this.params.onFlush(this.app);
  }

  deleteApp() {
    this.params.onDelete(this.app);
  }
}
