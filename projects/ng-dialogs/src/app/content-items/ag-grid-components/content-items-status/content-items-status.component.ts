import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { ContentItem } from '../../models/content-item.model';
import { PubMeta } from '../pub-meta-filter/pub-meta-filter.model';
import { ContentItemsStatusParams } from './content-items-status.models';

@Component({
  selector: 'app-content-items-status',
  templateUrl: './content-items-status.component.html',
  styleUrls: ['./content-items-status.component.scss'],
})
export class ContentItemsStatusComponent implements ICellRendererAngularComp {
  value: PubMeta;
  readOnly: boolean;
  metadataCount: number;
  metadataTooltip: string;

  private item: ContentItem;
  private params: ContentItemsStatusParams;

  agInit(params: ContentItemsStatusParams) {
    this.value = params.value;
    this.params = params;
    this.item = params.data;
    this.readOnly = this.item._EditInfo.ReadOnly;

    this.metadataCount = this.item.Metadata?.length ?? 0;

    this.metadataTooltip = this.item.For
      ? 'This item is metadata for:'
      + `\nTarget: ${this.item.For.Target}`
      + `\nTargetType: ${this.item.For.TargetType}`
      + (this.item.For.Number ? `\nNumber: ${this.item.For.Number}` : '')
      + (this.item.For.String ? `\nString: ${this.item.For.String}` : '')
      + (this.item.For.Guid ? `\nGuid: ${this.item.For.Guid}` : '')
      + (this.item.For.Title ? `\nTitle: ${this.item.For.Title}` : '')
      : 'This item is not metadata.';
    this.metadataTooltip += `\n\nThis item has ${this.metadataCount > 0 ? this.metadataCount : 'no'} other metadata ${this.metadataCount === 1 ? 'item' : 'items'} attached to it.`;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openMetadata() {
    this.params.onOpenMetadata(this.item);
  }
}
