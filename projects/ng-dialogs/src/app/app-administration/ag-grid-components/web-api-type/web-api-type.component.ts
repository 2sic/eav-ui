import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-web-api-type',
  templateUrl: './web-api-type.component.html',
  styleUrls: ['./web-api-type.component.scss'],
})
export class WebApiTypeComponent implements ICellRendererAngularComp {
  value: boolean;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
