import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

import { ContentItem } from '../../models/content-item.model';

@Component({
  selector: 'app-content-items-id',
  templateUrl: './content-items-id.component.html',
  styleUrls: ['./content-items-id.component.scss']
})
export class ContentItemsIdComponent implements ICellRendererAngularComp {
  value: string;
  tooltip: string;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
    const item: ContentItem = params.data;
    this.tooltip = `Id: ${item.Id}\nRepoId: ${item._RepositoryId}\nGuid: ${item.Guid}`;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
