import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-data-items',
  templateUrl: './data-items.component.html',
  styleUrls: ['./data-items.component.scss'],
})
export class DataItemsComponent implements ICellRendererAngularComp {
  value: number;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
