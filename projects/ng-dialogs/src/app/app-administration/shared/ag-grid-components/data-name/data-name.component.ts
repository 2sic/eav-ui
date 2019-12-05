import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

import { ContentType } from '../../models/content-type.model';

@Component({
  selector: 'app-data-name',
  templateUrl: './data-name.component.html',
  styleUrls: ['./data-name.component.scss']
})
export class DataNameComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;
  contentType: ContentType;

  agInit(params: ICellRendererParams) {
    this.params = params;
    this.contentType = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  addData(event: MouseEvent) {
    event.stopPropagation();
    alert('Add data!');
    // this.params.onAddData(this.app);
  }
}
