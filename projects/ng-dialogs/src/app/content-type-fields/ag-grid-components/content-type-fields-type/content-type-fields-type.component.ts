import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { calculateTypeIcon } from '../../content-type-fields.helpers';

@Component({
  selector: 'app-content-type-fields-type',
  templateUrl: './content-type-fields-type.component.html',
  styleUrls: ['./content-type-fields-type.component.scss'],
})
export class ContentTypeFieldsTypeComponent implements ICellRendererAngularComp {
  value: string;
  icon: string;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
    this.icon = calculateTypeIcon(this.value);
  }

  refresh(params?: any): boolean {
    return true;
  }
}
