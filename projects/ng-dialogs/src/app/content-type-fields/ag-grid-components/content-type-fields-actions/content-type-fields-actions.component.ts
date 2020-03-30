import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentTypeFieldsActionsParams } from '../models/content-type-fields-actions-params';
import { Field } from '../models/field.model';

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
    this.showPermissions = this.field.InputType === 'string-wysiwyg' || this.field.Type === 'Hyperlink';
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
