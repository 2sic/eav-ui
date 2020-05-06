import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentTypeFieldsActionsParams } from './content-type-fields-actions.models';
import { Field } from '../../models/field.model';
import { InputTypeConstants } from '../../constants/input-type.constants';
import { DataTypeConstants } from '../../constants/data-type.constants';

@Component({
  selector: 'app-content-type-fields-actions',
  templateUrl: './content-type-fields-actions.component.html',
  styleUrls: ['./content-type-fields-actions.component.scss']
})
export class ContentTypeFieldsActionsComponent implements ICellRendererAngularComp {
  private params: ContentTypeFieldsActionsParams;
  field: Field;
  showPermissions: boolean;

  agInit(params: ContentTypeFieldsActionsParams) {
    this.params = params;
    this.field = params.data;
    this.showPermissions = this.field.InputType === InputTypeConstants.StringWysiwyg || this.field.Type === DataTypeConstants.Hyperlink;
  }

  refresh(params?: any): boolean {
    return true;
  }

  rename() {
    this.params.onRename(this.field);
  }

  delete() {
    this.params.onDelete(this.field);
  }

  openPermissions() {
    this.params.onOpenPermissions(this.field);
  }
}
