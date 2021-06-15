import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-content-type-fields-input-type',
  templateUrl: './content-type-fields-input-type.component.html',
  styleUrls: ['./content-type-fields-input-type.component.scss'],
})
export class ContentTypeFieldsInputTypeComponent implements ICellRendererAngularComp {
  value: string;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
