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
  params: ICellRendererParams;
  contentType: ContentType;

  agInit(params: ICellRendererParams) {
    this.params = params;
    this.contentType = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openFields() {
    alert('Open fields!');
    // this.params.onOpenFields(this.app);
  }
}
