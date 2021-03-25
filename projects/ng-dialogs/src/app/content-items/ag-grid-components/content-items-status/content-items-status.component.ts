import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentItem } from '../../models/content-item.model';
import { PubMeta } from '../pub-meta-filter/pub-meta-filter.model';

@Component({
  selector: 'app-content-items-status',
  templateUrl: './content-items-status.component.html',
  styleUrls: ['./content-items-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
        + `\nType: ${item.For.TargetType}`
        + (item.For.KeyNumber ? `\nNumber: ${item.For.KeyNumber}` : '')
        + (item.For.KeyString ? `\nString: ${item.For.KeyString}` : '')
        + (item.For.KeyGuid ? `\nGuid: ${item.For.KeyGuid}` : '');
    }
  }

  refresh(params?: any): boolean {
    return true;
  }
}
