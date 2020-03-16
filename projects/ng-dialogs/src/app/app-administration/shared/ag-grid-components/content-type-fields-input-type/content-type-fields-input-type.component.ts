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
  params: ContentTypeFieldsInputTypeParams;
  field: Field;
  inputType: string;

  agInit(params: ContentTypeFieldsInputTypeParams) {
    this.params = params;
    this.field = params.data;
    this.inputType = this.field.InputType.substring(this.field.InputType.indexOf('-') + 1);
  }

  refresh(params?: any): boolean {
    return true;
  }

  changeInputType() {
    this.params.onChangeInputType(this.field);
  }
}
