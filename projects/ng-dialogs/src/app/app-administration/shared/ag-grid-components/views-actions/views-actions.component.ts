import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

import { View } from '../../models/view.model';

@Component({
  selector: 'app-views-actions',
  templateUrl: './views-actions.component.html',
  styleUrls: ['./views-actions.component.scss']
})
export class ViewsActionsComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;
  view: View;

  agInit(params: ICellRendererParams) {
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

  deleteQuery(event: MouseEvent) {
    event.stopPropagation();
    alert('Delete view!');
    // this.params.onOpenFields(this.app);
  }
}
