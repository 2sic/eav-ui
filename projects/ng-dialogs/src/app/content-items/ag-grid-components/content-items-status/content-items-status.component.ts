import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { ContentItem } from '../../models/content-item.model';
import { PubMeta } from '../pub-meta-filter/pub-meta-filter.model';

@Component({
  selector: 'app-content-items-status',
  templateUrl: './content-items-status.component.html',
  styleUrls: ['./content-items-status.component.scss'],
})
export class ContentItemsStatusComponent implements ICellRendererAngularComp {
  value: PubMeta;
  metadataTooltip: string;

  agInit(params: ICellRendererParams) {
    // spm TODO: something about data.DraftEntity and data.PublishedEntity is missing. Search in eav-ui project
    this.value = params.value;
    const item: ContentItem = params.data;
    if (item.For) {
      this.metadataTooltip = 'Metadata'
        + `\nType: ${item.For.Target}`
        + (item.For.Number ? `\nNumber: ${item.For.Number}` : '')
        + (item.For.String ? `\nString: ${item.For.String}` : '')
        + (item.For.Guid ? `\nGuid: ${item.For.Guid}` : '');
    }
  }

  refresh(params?: any): boolean {
    return true;
  }
}
