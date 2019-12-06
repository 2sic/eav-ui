import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

import { View } from '../../models/view.model';

@Component({
  selector: 'app-views-show',
  templateUrl: './views-show.component.html',
  styleUrls: ['./views-show.component.scss']
})
export class ViewsShowComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;
  view: View;

  agInit(params: ICellRendererParams) {
    this.params = params;
    this.view = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

}
