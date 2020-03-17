import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentType } from '../../models/content-type.model';
import { DataFieldsParams } from '../../models/data-fields-params';

@Component({
  selector: 'app-data-fields',
  templateUrl: './data-fields.component.html',
  styleUrls: ['./data-fields.component.scss']
})
export class DataFieldsComponent implements ICellRendererAngularComp {
  private params: DataFieldsParams;
  contentType: ContentType;
  value: number;

  agInit(params: DataFieldsParams) {
    this.params = params;
    this.contentType = params.data;
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  editFields() {
    this.params.onEditFields(this.contentType);
  }
}
