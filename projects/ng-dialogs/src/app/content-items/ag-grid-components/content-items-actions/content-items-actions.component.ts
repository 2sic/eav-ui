import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentItemsActionsParams } from '../../models/content-items-actions-params';
import { ContentItem } from '../../models/content-item.model';

@Component({
  selector: 'app-content-items-actions',
  templateUrl: './content-items-actions.component.html',
  styleUrls: ['./content-items-actions.component.scss']
})
export class ContentItemsActionsComponent implements ICellRendererAngularComp {
  params: ContentItemsActionsParams;
  item: ContentItem;

  agInit(params: ContentItemsActionsParams) {
    this.params = params;
    this.item = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  clone() {
    this.params.onClone(this.item);
  }

  export() {
    this.params.onExport(this.item);
  }

  delete() {
    this.params.onDelete(this.item);
  }
}
