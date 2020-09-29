import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataTypeConstants } from '../../constants/data-type.constants';
import { InputTypeConstants } from '../../constants/input-type.constants';
import { Field } from '../../models/field.model';
import { ContentTypeFieldsActionsParams } from './content-type-fields-actions.models';

@Component({
  selector: 'app-content-type-fields-actions',
  templateUrl: './content-type-fields-actions.component.html',
  styleUrls: ['./content-type-fields-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentTypeFieldsActionsComponent implements ICellRendererAngularComp {
  field: Field;
  enablePermissions: boolean;
  private params: ContentTypeFieldsActionsParams;

  constructor() { }

  agInit(params: ContentTypeFieldsActionsParams) {
    this.params = params;
    this.field = this.params.data;
    this.enablePermissions = this.field.InputType === InputTypeConstants.StringWysiwyg || this.field.Type === DataTypeConstants.Hyperlink;
  }

  refresh(params?: any): boolean {
    return true;
  }

  rename() {
    this.params.onRename(this.field);
  }

  openPermissions() {
    this.params.onOpenPermissions(this.field);
  }

  deleteField() {
    this.params.onDelete(this.field);
  }
}
