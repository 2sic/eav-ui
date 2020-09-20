import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentItemsActionsParams } from './content-items-actions.models';
import { ContentItem } from '../../models/content-item.model';

@Component({
  selector: 'app-content-items-actions',
  templateUrl: './content-items-actions.component.html',
  styleUrls: ['./content-items-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentItemsActionsComponent implements ICellRendererAngularComp {
  private params: ContentItemsActionsParams;
  private item: ContentItem;

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

  deleteItem() {
    this.params.onDelete(this.item);
  }
}
