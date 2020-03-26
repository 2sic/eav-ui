import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentTypeFieldsTitleParams } from '../../app-administration/shared/models/content-type-fields-title-params';
import { Field } from '../../app-administration/shared/models/field.model';

@Component({
  selector: 'app-content-type-fields-title',
  templateUrl: './content-type-fields-title.component.html',
  styleUrls: ['./content-type-fields-title.component.scss']
})
export class ContentTypeFieldsTitleComponent implements ICellRendererAngularComp {
  private params: ContentTypeFieldsTitleParams;
  value: boolean;

  agInit(params: ContentTypeFieldsTitleParams) {
    this.params = params;
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  setTitle() {
    const field: Field = this.params.data;
    this.params.onSetTitle(field);
  }
}
