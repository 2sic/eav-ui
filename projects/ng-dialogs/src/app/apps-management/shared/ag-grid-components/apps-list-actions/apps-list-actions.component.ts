import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { App } from '../../../../shared/models/app.model';
import { AppsListActionsParams } from '../../models/apps-list-actions-params.model';

@Component({
  selector: 'app-apps-list-actions',
  templateUrl: './apps-list-actions.component.html',
  styleUrls: ['./apps-list-actions.component.scss']
})
export class AppsListActionsComponent implements ICellRendererAngularComp {
  params: AppsListActionsParams;
  app: App;

  agInit(params: AppsListActionsParams) {
    this.params = params;
    this.app = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  deleteApp() {
    this.params.onDelete(this.app);
  }
}
