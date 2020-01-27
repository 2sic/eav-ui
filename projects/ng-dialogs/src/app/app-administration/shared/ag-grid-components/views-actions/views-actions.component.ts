import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { View } from '../../models/view.model';
import { ViewsActionsParams } from '../../models/views-actions-params';

@Component({
  selector: 'app-views-actions',
  templateUrl: './views-actions.component.html',
  styleUrls: ['./views-actions.component.scss']
})
export class ViewsActionsComponent implements ICellRendererAngularComp {
  params: ViewsActionsParams;
  view: View;

  agInit(params: ViewsActionsParams) {
    this.params = params;
    this.view = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openPermissions(event: MouseEvent) {
    event.stopPropagation();
    alert('Open permissions!');
    // this.params.onOpenFields(this.app);
  }

  deleteView(event: MouseEvent) {
    event.stopPropagation();
    this.params.onDelete(this.view);
  }
}
