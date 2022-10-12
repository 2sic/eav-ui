import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { ContentType } from '../../models/content-type.model';
import { DataFieldsParams } from './data-fields.models';

@Component({
  selector: 'app-data-fields',
  templateUrl: './data-fields.component.html',
  styleUrls: ['./data-fields.component.scss'],
})
export class DataFieldsComponent implements ICellRendererAngularComp {
  value: number;
  tooltip: string;
  icon: string;

  private params: ICellRendererParams & DataFieldsParams;
  private contentType: ContentType;

  agInit(params: ICellRendererParams & DataFieldsParams): void {
    this.params = params;
    this.contentType = params.data;
    this.value = params.value;
    this.tooltip = !this.contentType.EditInfo.ReadOnly
      ? 'Edit fields'
      : `${this.contentType.EditInfo.ReadOnlyMessage ? `${this.contentType.EditInfo.ReadOnlyMessage}\n\n` : ''}This ContentType shares the definition of #${this.contentType.SharedDefId} so you can't edit it here. Read 2sxc.org/help?tag=shared-types`;
    this.icon = !this.contentType.EditInfo.ReadOnly ? 'dns' : 'share';
  }

  refresh(params?: any): boolean {
    return true;
  }

  editFields(): void {
    this.params.onEditFields(this.contentType);
  }
}
