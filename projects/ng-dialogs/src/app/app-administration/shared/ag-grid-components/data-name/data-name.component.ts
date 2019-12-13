import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentType } from '../../models/content-type.model';
import { DataNameParams } from '../../models/data-name-params';

@Component({
  selector: 'app-data-name',
  templateUrl: './data-name.component.html',
  styleUrls: ['./data-name.component.scss']
})
export class DataNameComponent implements ICellRendererAngularComp {
  params: DataNameParams;
  contentType: ContentType;

  agInit(params: DataNameParams) {
    this.params = params;
    this.contentType = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  addItem(event: MouseEvent) {
    event.stopPropagation();
    this.params.onAddItem(this.contentType);
  }
}
