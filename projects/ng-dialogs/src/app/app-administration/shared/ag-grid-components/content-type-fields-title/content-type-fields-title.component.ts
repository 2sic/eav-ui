import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentTypeFieldsTitleParams } from '../../models/content-type-fields-title-params';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-content-type-fields-title',
  templateUrl: './content-type-fields-title.component.html',
  styleUrls: ['./content-type-fields-title.component.scss']
})
export class ContentTypeFieldsTitleComponent implements ICellRendererAngularComp {
  params: ContentTypeFieldsTitleParams;
  field: Field;

  agInit(params: ContentTypeFieldsTitleParams) {
    this.params = params;
    this.field = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  setTitle() {
    this.params.onSetTitle(this.field);
  }
}
