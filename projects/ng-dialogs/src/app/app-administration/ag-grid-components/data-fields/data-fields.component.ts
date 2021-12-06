import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { ContentType } from '../../models/content-type.model';
import { DataFieldsParams } from './data-fields.models';

@Component({
  selector: 'app-data-fields',
  templateUrl: './data-fields.component.html',
  styleUrls: ['./data-fields.component.scss'],
})
export class DataFieldsComponent implements ICellRendererAngularComp {
  contentType: ContentType;
  value: number;
  private params: DataFieldsParams;

  agInit(params: DataFieldsParams): void {
    this.params = params;
    this.contentType = params.data;
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  editFields(): void {
    this.params.onEditFields(this.contentType);
  }
}
