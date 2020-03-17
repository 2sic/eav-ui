import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { View } from '../../models/view.model';
import { ViewActionsParams } from '../../models/view-actions-params';

@Component({
  selector: 'app-views-actions',
  templateUrl: './views-actions.component.html',
  styleUrls: ['./views-actions.component.scss']
})
export class ViewsActionsComponent implements ICellRendererAngularComp {
  private params: ViewActionsParams;

  agInit(params: ViewActionsParams) {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openPermissions() {
    const view: View = this.params.data;
    this.params.onOpenPermissions(view);
  }

  deleteView() {
    const view: View = this.params.data;
    this.params.onDelete(view);
  }
}
