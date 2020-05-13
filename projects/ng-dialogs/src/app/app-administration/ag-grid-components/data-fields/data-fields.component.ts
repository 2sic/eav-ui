import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

import { ContentType } from '../../models/content-type.model';

@Component({
  selector: 'app-data-fields',
  templateUrl: './data-fields.component.html',
  styleUrls: ['./data-fields.component.scss']
})
export class DataFieldsComponent implements ICellRendererAngularComp {
  contentType: ContentType;
  value: number;

  agInit(params: ICellRendererParams) {
    this.contentType = params.data;
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
