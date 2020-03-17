import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentType } from '../../models/content-type.model';
import { DataItemsParams } from '../../models/data-items-params';

@Component({
  selector: 'app-data-items',
  templateUrl: './data-items.component.html',
  styleUrls: ['./data-items.component.scss']
})
export class DataItemsComponent implements ICellRendererAngularComp {
  private params: DataItemsParams;
  value: number;

  agInit(params: DataItemsParams) {
    this.params = params;
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  addItem() {
    const contentType: ContentType = this.params.data;
    this.params.onAddItem(contentType);
  }
}
