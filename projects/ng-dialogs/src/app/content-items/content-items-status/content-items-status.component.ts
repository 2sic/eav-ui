import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

import { PubMeta } from '../pub-meta-filter/pub-meta-filter.model';
import { ContentItem } from '../models/content-item.model';

@Component({
  selector: 'app-content-items-status',
  templateUrl: './content-items-status.component.html',
  styleUrls: ['./content-items-status.component.scss']
})
export class ContentItemsStatusComponent implements ICellRendererAngularComp {
  value: PubMeta;
  metadataTooltip: string;

  agInit(params: ICellRendererParams) {
    // spm TODO: something about data.DraftEntity and data.PublishedEntity is missing. Search in eav-ui project
    this.value = params.value;
    const item: ContentItem = params.data;
    if (item.Metadata) {
      this.metadataTooltip = 'Metadata'
        + `\nType: ${item.Metadata.TargetType}`
        + (item.Metadata.KeyNumber ? `\nNumber: ${item.Metadata.KeyNumber}` : '')
        + (item.Metadata.KeyString ? `\nString: ${item.Metadata.KeyString}` : '')
        + (item.Metadata.KeyGuid ? `\nGuid: ${item.Metadata.KeyGuid}` : '');
    }
  }

  refresh(params?: any): boolean {
    return true;
  }
}
