import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { EavForInAdminUi } from '../../edit/shared/models/eav';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { ContentItem } from '../models/content-item.model';
import { PubMeta } from '../pub-meta-filter/pub-meta-filter.model';

type GoToUrls = 'openMetadata'

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
export class ContentItemsStatusComponent implements ICellRendererAngularComp {
  value: PubMeta;
  disableMetadata: boolean;
  metadataCount: number;
  metadataTooltip: string;

  protected item: ContentItem;

  public params: {
    urlTo(verb: GoToUrls, item: ContentItem): string;
  };

  agInit(params: ICellRendererParams & ContentItemsStatusComponent['params']): void {
    this.params = params;
    this.value = params.value;
    this.item = params.data;
    this.disableMetadata = this.item._EditInfo.DisableMetadata;

    this.metadataCount = this.item.Metadata?.length ?? 0;

    const mdf = this.item.For as EavForInAdminUi;
    this.metadataTooltip = mdf
      ? 'This item is metadata for:'
      + `\nTarget: ${mdf.Target}`
      + `\nTargetType: ${mdf.TargetType}`
      + (mdf.KeyNumber ? `\nNumber: ${mdf.KeyNumber}` : '')
      + (mdf.KeyString ? `\nString: ${mdf.KeyString}` : '')
      + (mdf.KeyGuid ? `\nGuid: ${mdf.KeyGuid}` : '')
      + (mdf.Title ? `\nTitle: ${mdf.Title}` : '')
      : 'This item is not metadata.';
    this.metadataTooltip += `\n\nThis item has ${this.metadataCount > 0 ? this.metadataCount : 'no'} other metadata ${this.metadataCount === 1 ? 'item' : 'items'} attached to it.`;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
