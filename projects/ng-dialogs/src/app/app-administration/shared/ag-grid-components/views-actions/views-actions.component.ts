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
  params: ViewActionsParams;
  view: View;

  agInit(params: ViewActionsParams) {
    this.params = params;
    this.view = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openPermissions(event: MouseEvent) {
    event.stopPropagation();
    this.params.onOpenPermissions(this.view);
  }

  deleteView(event: MouseEvent) {
    event.stopPropagation();
    this.params.onDelete(this.view);
  }
}
