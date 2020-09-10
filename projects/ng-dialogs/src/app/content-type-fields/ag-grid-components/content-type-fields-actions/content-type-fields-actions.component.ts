import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentTypeFieldsActionsParams } from './content-type-fields-actions.models';
import { Field } from '../../models/field.model';
import { InputTypeConstants } from '../../constants/input-type.constants';
import { DataTypeConstants } from '../../constants/data-type.constants';

@Component({
  selector: 'app-content-type-fields-actions',
  templateUrl: './content-type-fields-actions.component.html',
  styleUrls: ['./content-type-fields-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentTypeFieldsActionsComponent implements ICellRendererAngularComp {
  field: Field;
  showPermissions: boolean;
  private params: ContentTypeFieldsActionsParams;

  agInit(params: ContentTypeFieldsActionsParams) {
    this.params = params;
    this.field = this.params.data;
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
