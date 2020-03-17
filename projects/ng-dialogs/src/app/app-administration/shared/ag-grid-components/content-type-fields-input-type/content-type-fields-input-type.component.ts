import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentTypeFieldsInputTypeParams } from '../../models/content-type-fields-input-type-params';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-content-type-fields-input-type',
  templateUrl: './content-type-fields-input-type.component.html',
  styleUrls: ['./content-type-fields-input-type.component.scss']
})
export class ContentTypeFieldsInputTypeComponent implements ICellRendererAngularComp {
  private params: ContentTypeFieldsInputTypeParams;
  value: string;
  inputType: string;

  agInit(params: ContentTypeFieldsInputTypeParams) {
    this.params = params;
    this.value = params.value;
    this.inputType = this.value.substring(this.value.indexOf('-') + 1);
  }

  refresh(params?: any): boolean {
    return true;
  }

  changeInputType() {
    const field: Field = this.params.data;
    this.params.onChangeInputType(field);
  }
}
