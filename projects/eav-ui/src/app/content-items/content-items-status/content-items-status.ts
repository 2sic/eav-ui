import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { EavForInAdminUi } from '../../edit/shared/models/eav';
import { AgGridCellRendererBaseComponent } from '../../shared/ag-grid/ag-grid-cell-renderer-base';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { ContentItem } from '../models/content-item.model';
import { PubMeta } from '../pub-meta-filter/pub-meta-filter.model';

@Component({
  selector: 'app-content-items-status',
  templateUrl: './content-items-status.html',
  styleUrls: ['./content-items-status.scss'],
  imports: [
    MatIconModule,
    MatRippleModule,
    NgClass,
    MatBadgeModule,
    TippyDirective,
  ]
})
export class ContentItemsStatusComponent
  extends AgGridCellRendererBaseComponent<ContentItem, PubMeta, ContentItemsStatusParams> {

  get item(): ContentItem {
    return this.data;
  }

  get disableMetadata(): boolean {
    return this.item._EditInfo.DisableMetadata;
  }

  get metadataCount(): number {
    return this.item.Metadata?.length ?? 0;
  }

  get metadataTooltip(): string {
    const metadataFor = this.item.For as EavForInAdminUi;
    let tooltip = metadataFor
      ? 'This item is metadata for:'
        + `\nTarget: ${metadataFor.Target}`
        + `\nTargetType: ${metadataFor.TargetType}`
        + (metadataFor.KeyNumber ? `\nNumber: ${metadataFor.KeyNumber}` : '')
        + (metadataFor.KeyString ? `\nString: ${metadataFor.KeyString}` : '')
        + (metadataFor.KeyGuid ? `\nGuid: ${metadataFor.KeyGuid}` : '')
        + (metadataFor.Title ? `\nTitle: ${metadataFor.Title}` : '')
      : 'This item is not metadata.';

    tooltip += `\n\nThis item has ${this.metadataCount > 0 ? this.metadataCount : 'no'} other metadata ${this.metadataCount === 1 ? 'item' : 'items'} attached to it.`;

    return tooltip;
  }
}

export type ContentItemsStatusVerb = 'openMetadata';

export interface ContentItemsStatusParams {
  urlTo(verb: ContentItemsStatusVerb, item: ContentItem): string;
}