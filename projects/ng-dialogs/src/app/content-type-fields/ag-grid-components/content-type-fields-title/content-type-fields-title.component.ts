import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-content-type-fields-title',
  templateUrl: './content-type-fields-title.component.html',
  styleUrls: ['./content-type-fields-title.component.scss'],
})
export class ContentTypeFieldsTitleComponent implements ICellRendererAngularComp {
  isTitle: boolean;

  agInit(params: ICellRendererParams) {
    this.isTitle = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
