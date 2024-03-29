import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Field } from '../models/field.model';
import { ContentTypeFieldsInputTypeParams } from './content-type-fields-input-type.models';

@Component({
  selector: 'app-content-type-fields-input-type',
  templateUrl: './content-type-fields-input-type.component.html',
  styleUrls: ['./content-type-fields-input-type.component.scss'],
})
export class ContentTypeFieldsInputTypeComponent implements ICellRendererAngularComp {
  value: string;
  field: Field;

  private params: ICellRendererParams & ContentTypeFieldsInputTypeParams;

  agInit(params: ICellRendererParams & ContentTypeFieldsInputTypeParams): void {
    this.params = params;
    this.value = params.value;
    this.field = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  changeInputType(): void {
    this.params.onChangeInputType(this.field);
  }
}
