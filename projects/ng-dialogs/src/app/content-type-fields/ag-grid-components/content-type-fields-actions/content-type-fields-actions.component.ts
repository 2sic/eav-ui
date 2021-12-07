import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { DataTypeConstants } from '../../constants/data-type.constants';
import { InputTypeConstants } from '../../constants/input-type.constants';
import { Field } from '../../models/field.model';
import { ContentTypeFieldsActionsParams } from './content-type-fields-actions.models';

@Component({
  selector: 'app-content-type-fields-actions',
  templateUrl: './content-type-fields-actions.component.html',
  styleUrls: ['./content-type-fields-actions.component.scss'],
})
export class ContentTypeFieldsActionsComponent implements ICellRendererAngularComp {
  field: Field;
  metadataCount: number;
  enablePermissions: boolean;
  private params: ContentTypeFieldsActionsParams;

  constructor() { }

  agInit(params: ContentTypeFieldsActionsParams) {
    this.params = params;
    this.field = this.params.data;
    this.metadataCount = this.field.Metadata ? Object.keys(this.field.Metadata).filter(key => key !== 'merged').length : 0;
    this.enablePermissions = this.field.InputType === InputTypeConstants.StringWysiwyg || this.field.Type === DataTypeConstants.Hyperlink;
  }

  refresh(params?: any): boolean {
    return true;
  }

  editFieldMetadata() {
    this.params.onEditFieldMetadata(this.field);
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
