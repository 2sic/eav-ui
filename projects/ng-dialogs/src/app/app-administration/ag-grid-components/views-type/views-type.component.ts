import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { calculateViewType } from '../../views/views.helpers';

@Component({
  selector: 'app-views-type',
  templateUrl: './views-type.component.html',
  styleUrls: ['./views-type.component.scss'],
})
export class ViewsTypeComponent implements ICellRendererAngularComp {
  value: string;
  icon: string;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
    const view = params.data;
    const type = calculateViewType(view);
    this.icon = type.icon;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
